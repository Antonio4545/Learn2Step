import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SoundCloudTrack {
  id: number;
  title: string;
  duration: number;
  user?: { username?: string };
  metadata_artist?: string;
  artwork_url?: string | null;
  permalink_url?: string;
  /** Present only when a trusted API response exposes a directly playable stream. */
  stream_url?: string;
}

export interface SoundCloudPlaylistInfo {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url?: string;
  html: string;
}

export interface SoundCloudWidgetEvent {
  currentPosition?: number;
  loadProgress?: number;
  relativePosition?: number;
}

export interface SoundCloudWidget {
  bind(eventName: string, listener: (event?: SoundCloudWidgetEvent) => void): void;
  unbind(eventName?: string): void;
  play(): void;
  pause(): void;
  next(): void;
  prev(): void;
  skip(index: number): void;
  seekTo(milliseconds: number): void;
  getSounds(callback: (sounds: SoundCloudTrack[]) => void): void;
  getCurrentSound(callback: (track: SoundCloudTrack) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
}

interface SoundCloudWindow extends Window {
  SC?: { Widget: (iframe: HTMLIFrameElement) => SoundCloudWidget };
}

@Injectable({ providedIn: 'root' })
export class SoundcloudService {
  readonly playlistUrl = environment.soundcloudPlaylistUrl.trim();
  private widgetApiPromise?: Promise<void>;

  constructor(private readonly http: HttpClient) {}

  fetchPlaylistInfo(playlistUrl = this.playlistUrl): Observable<SoundCloudPlaylistInfo> {
    const params = new HttpParams().set('format', 'json').set('url', playlistUrl);
    return this.http.get<SoundCloudPlaylistInfo>('https://soundcloud.com/oembed', { params });
  }

  getWidgetUrl(playlistUrl = this.playlistUrl): string {
    const params = new URLSearchParams({
      url: playlistUrl,
      color: '5b2c83',
      auto_play: 'false',
      show_artwork: 'false',
      show_user: 'false',
      show_playcount: 'false',
      sharing: 'false',
      download: 'false',
    });
    return `https://w.soundcloud.com/player/?${params.toString()}`;
  }

  /**
   * Retrieves the track list from SoundCloud's supported Widget API. The public
   * REST API now requires OAuth tokens; those credentials must not be shipped in
   * an Angular bundle. HttpClient is used separately for playlist/oEmbed
   * metadata above.
   */
  fetchPlaylistTracks(widget: SoundCloudWidget): Observable<SoundCloudTrack[]> {
    return new Observable((subscriber) => {
      widget.getSounds((tracks) => {
        subscriber.next(tracks ?? []);
        subscriber.complete();
      });
    });
  }

  async createWidget(iframe: HTMLIFrameElement): Promise<SoundCloudWidget> {
    await this.loadWidgetApi();
    const soundCloud = (window as SoundCloudWindow).SC;
    if (!soundCloud) throw new Error('The SoundCloud player could not be initialized.');
    return soundCloud.Widget(iframe);
  }

  private loadWidgetApi(): Promise<void> {
    const soundCloudWindow = window as SoundCloudWindow;
    if (soundCloudWindow.SC) return Promise.resolve();
    if (this.widgetApiPromise) return this.widgetApiPromise;

    this.widgetApiPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => soundCloudWindow.SC ? resolve() : reject(new Error('SoundCloud Widget API did not initialize.'));
      script.onerror = () => reject(new Error('Could not load the SoundCloud player. Check your internet connection.'));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      this.widgetApiPromise = undefined;
      throw error;
    });

    return this.widgetApiPromise!;
  }
}
