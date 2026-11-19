import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AlertController, IonContent, IonFooter, IonHeader, IonIcon, IonSpinner, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronBack, chevronForward, heart, heartOutline, home, musicalNotes,
  pause, play, playCircle, radio, radioOutline, repeat, ribbonOutline,
  shuffle, playSkipBack, playSkipForward, person,
} from 'ionicons/icons';
import { Learn2StepLogoComponent } from '../shared/learn2step-logo.component';
import { SoundcloudService, SoundCloudTrack, SoundCloudWidget, SoundCloudWidgetEvent } from './soundcloud.service';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.page.html',
  styleUrl: './radio.page.scss',
  imports: [CommonModule, FormsModule, IonContent, IonFooter, IonHeader, IonIcon, IonSpinner, IonToolbar, Learn2StepLogoComponent, RouterLink],
})
export class RadioPage implements OnInit, OnDestroy {
  private audioPlayer?: HTMLAudioElement;
  @ViewChild('radioPlayer')
  set radioPlayer(ref: ElementRef<HTMLAudioElement> | undefined) {
    this.audioPlayer = ref?.nativeElement;
  }

  @ViewChild('soundcloudFrame')
  set soundcloudFrame(ref: ElementRef<HTMLIFrameElement> | undefined) {
    if (ref && !this.widget && !this.widgetPromise) this.initializeWidget(ref.nativeElement);
  }

  readonly soundCloudData = signal<SoundCloudTrack[]>([]);
  readonly currentTrack = signal<SoundCloudTrack | null>(null);
  readonly widgetUrl = signal<SafeResourceUrl | null>(null);
  readonly isPlaying = signal(false);
  readonly isBuffering = signal(false);
  readonly isFavorite = signal(false);
  readonly isShuffle = signal(false);
  readonly isRepeat = signal(false);
  readonly loadError = signal('');
  currentSeconds = 0;
  durationSeconds = 0;
  private widget?: SoundCloudWidget;
  private widgetPromise?: Promise<void>;
  private destroyed = false;

  constructor(
    private readonly alerts: AlertController,
    private readonly soundcloud: SoundcloudService,
    private readonly sanitizer: DomSanitizer,
    private readonly destroyRef: DestroyRef,
  ) {
    addIcons({ chevronBack, chevronForward, heart, heartOutline, home, musicalNotes, pause, play, playCircle, radio, radioOutline, repeat, ribbonOutline, shuffle, playSkipBack, playSkipForward, person });
  }

  ngOnInit(): void {
    const playlistUrl = this.soundcloud.playlistUrl;
    if (!playlistUrl) {
      this.loadError.set('Add your SoundCloud playlist share URL to soundcloudPlaylistUrl in the environment settings to enable radio playback.');
      return;
    }

    this.widgetUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.soundcloud.getWidgetUrl(playlistUrl)));
    this.isBuffering.set(true);
    this.soundcloud.fetchPlaylistInfo(playlistUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadError.set(''),
      error: () => {
        this.isBuffering.set(false);
        this.loadError.set('Could not load the SoundCloud playlist. Check that the playlist is public and its URL is correct.');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.widget?.pause();
    this.widget?.unbind();
  }

  get trackTitle(): string { return this.currentTrack()?.title ?? 'Learn 2 Step Radio'; }
  get artist(): string {
    const track = this.currentTrack();
    return track?.metadata_artist || track?.user?.username || 'The Soundtrack for Steppers';
  }
  get currentTimeLabel(): string { return this.formatTime(this.currentSeconds); }
  get durationLabel(): string { return this.formatTime(this.durationSeconds / 1000); }
  get progressPercent(): string { return `${this.durationSeconds ? (this.currentSeconds * 1000 / this.durationSeconds) * 100 : 0}%`; }

  togglePlayback(): void {
    if (this.currentTrack()?.stream_url && this.audioPlayer) {
      this.togglePlayPause();
      return;
    }
    if (!this.widget) return;
    if (this.isPlaying()) {
      this.widget.pause();
      this.isPlaying.set(false);
    } else {
      this.isBuffering.set(true);
      this.widget.play();
    }
  }

  playAudio(): void {
    if (!this.audioPlayer) return;
    this.isBuffering.set(true);
    void this.audioPlayer.play().then(() => this.isPlaying.set(true)).catch(() => {
      this.isPlaying.set(false);
      this.isBuffering.set(false);
      this.loadError.set('This SoundCloud stream could not be played.');
    });
  }

  pauseAudio(): void {
    this.audioPlayer?.pause();
    this.isPlaying.set(false);
  }

  togglePlayPause(): void {
    if (!this.audioPlayer) return;
    if (this.audioPlayer.paused) this.playAudio();
    else this.pauseAudio();
  }

  onAudioTimeUpdate(): void {
    if (this.audioPlayer) this.currentSeconds = this.audioPlayer.currentTime;
  }

  onAudioMetadataLoaded(): void {
    if (!this.audioPlayer) return;
    this.durationSeconds = Number.isFinite(this.audioPlayer.duration) ? this.audioPlayer.duration * 1000 : 0;
    this.isBuffering.set(false);
  }

  onAudioWaiting(): void { this.isBuffering.set(true); }
  onAudioCanPlay(): void { this.isBuffering.set(false); }
  onAudioEnded(): void {
    if (this.isRepeat()) {
      if (this.audioPlayer) this.audioPlayer.currentTime = 0;
      this.playAudio();
    } else {
      this.isPlaying.set(false);
      this.nextTrack();
    }
  }

  toggleFavorite(): void { this.isFavorite.update((favorite) => !favorite); }
  toggleShuffle(): void { this.isShuffle.update((shuffle) => !shuffle); }
  toggleRepeat(): void { this.isRepeat.update((repeat) => !repeat); }

  seekTo(seconds: number): void {
    const next = Math.max(0, Math.min(Number(seconds) || 0, this.durationSeconds / 1000));
    this.currentSeconds = next;
    if (this.currentTrack()?.stream_url && this.audioPlayer) this.audioPlayer.currentTime = next;
    else this.widget?.seekTo(next * 1000);
  }

  previousTrack(): void {
    if (this.currentTrack()?.stream_url) {
      this.selectTrack((this.currentIndex - 1 + this.soundCloudData().length) % this.soundCloudData().length);
      return;
    }
    this.widget?.prev();
  }
  nextTrack(): void {
    const tracks = this.soundCloudData();
    if (this.currentTrack()?.stream_url && tracks.length) {
      const next = this.isShuffle() && tracks.length > 1
        ? (this.currentIndex + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length
        : (this.currentIndex + 1) % tracks.length;
      this.selectTrack(next);
      return;
    }
    if (this.isShuffle() && tracks.length > 1) {
      let next = Math.floor(Math.random() * tracks.length);
      if (next === this.currentIndex) next = (next + 1) % tracks.length;
      this.widget?.skip(next);
      return;
    }
    this.widget?.next();
  }

  async openPlaylist(): Promise<void> {
    const tracks = this.soundCloudData();
    if (!tracks.length) {
      const alert = await this.alerts.create({ header: 'Radio Playlist', message: this.loadError() || 'The playlist is loading.', buttons: ['Close'] });
      await alert.present();
      return;
    }
    const alert = await this.alerts.create({
      header: 'Radio Playlist',
      inputs: tracks.map((track, index) => ({ type: 'radio' as const, label: `${track.title} — ${track.metadata_artist || track.user?.username || 'Unknown artist'}`, value: String(index), checked: index === this.currentIndex })),
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Play', handler: (index: string) => this.selectTrack(Number(index)) }],
    });
    await alert.present();
  }

  formatTime(seconds: number): string {
    const whole = Math.floor(Number(seconds) || 0);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
  }

  private get currentIndex(): number {
    const currentId = this.currentTrack()?.id;
    return this.soundCloudData().findIndex((track) => track.id === currentId);
  }

  private selectTrack(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.soundCloudData().length) return;
    const track = this.soundCloudData()[index];
    if (track.stream_url) {
      this.currentTrack.set(track);
      this.currentSeconds = 0;
      this.durationSeconds = track.duration || 0;
      this.isBuffering.set(true);
      setTimeout(() => this.playAudio());
      return;
    }
    this.widget?.skip(index);
    this.isBuffering.set(true);
    this.widget?.play();
  }

  private initializeWidget(iframe: HTMLIFrameElement): void {
    this.widgetPromise = this.soundcloud.createWidget(iframe).then((widget) => {
      if (this.destroyed) { widget.unbind(); return; }
      this.widget = widget;
      widget.bind('READY', () => this.onReady());
      widget.bind('PLAY', () => { this.isPlaying.set(true); this.isBuffering.set(false); });
      widget.bind('PAUSE', () => { this.isPlaying.set(false); this.isBuffering.set(false); });
      widget.bind('PLAY_PROGRESS', (event) => this.onProgress(event));
      widget.bind('FINISH', () => {
        if (this.isRepeat()) { widget.seekTo(0); widget.play(); }
        else this.isPlaying.set(false);
      });
      widget.bind('ERROR', () => { this.isBuffering.set(false); this.loadError.set('SoundCloud could not play this track. It may be unavailable for playback.'); });
    }).catch(() => {
      if (!this.destroyed) {
        this.isBuffering.set(false);
        this.loadError.set('Could not initialize the SoundCloud player. Check your connection and playlist embed settings.');
      }
    });
  }

  private onReady(): void {
    if (!this.widget) return;
    this.soundcloud.fetchPlaylistTracks(this.widget).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((tracks) => {
      this.soundCloudData.set(tracks ?? []);
      if (!tracks?.length) this.loadError.set('This SoundCloud playlist has no playable tracks.');
    });
    this.widget.getCurrentSound((track) => { if (track) this.currentTrack.set(track); });
    this.widget.getDuration((duration) => { this.durationSeconds = duration || 0; this.isBuffering.set(false); });
    this.widget.getCurrentSoundIndex((index) => { if (index >= 0) this.syncTrackAt(index); });
  }

  private onProgress(event?: SoundCloudWidgetEvent): void {
    if (typeof event?.currentPosition === 'number') this.currentSeconds = event.currentPosition / 1000;
    if (typeof event?.loadProgress === 'number' && event.loadProgress >= 100) this.isBuffering.set(false);
    this.widget?.getCurrentSoundIndex((index) => { if (index >= 0 && index !== this.currentIndex) this.syncTrackAt(index); });
  }

  private syncTrackAt(index: number): void {
    const track = this.soundCloudData()[index];
    if (track) this.currentTrack.set(track);
    this.currentSeconds = 0;
    this.widget?.getDuration((duration) => { this.durationSeconds = duration || track?.duration || 0; });
    this.widget?.getCurrentSound((current) => { if (current) this.currentTrack.set(current); });
  }
}
