import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { routes } from '../app.routes';
import { RadioPage } from './radio.page';
import { SoundcloudService, SoundCloudTrack, SoundCloudWidget } from './soundcloud.service';

describe('RadioPage', () => {
  let fixture: ComponentFixture<RadioPage>;
  let component: RadioPage;
  let widget: SoundCloudWidget;

  const tracks: SoundCloudTrack[] = [
    { id: 1, title: 'Steppers Groove', duration: 277_000, user: { username: 'Chicago Steppers Collective' } },
    { id: 2, title: 'Midnight Two-Step', duration: 244_000, user: { username: 'Lakefront Rhythm' } },
  ];

  beforeEach(async () => {
    widget = {
      bind: vi.fn((eventName, listener) => { if (eventName === 'READY') listener(); }), unbind: vi.fn(), play: vi.fn(), pause: vi.fn(), next: vi.fn(), prev: vi.fn(),
      skip: vi.fn(), seekTo: vi.fn(),
      getSounds: vi.fn((callback) => callback(tracks)),
      getCurrentSound: vi.fn((callback) => callback(tracks[0])),
      getCurrentSoundIndex: vi.fn((callback) => callback(0)),
      getDuration: vi.fn((callback) => callback(tracks[0].duration)),
    };

    await TestBed.configureTestingModule({
      imports: [RadioPage],
      providers: [
        provideRouter([]),
        { provide: AlertController, useValue: { create: vi.fn().mockResolvedValue({ present: vi.fn() }) } },
        {
          provide: SoundcloudService,
          useValue: {
            playlistUrl: 'https://soundcloud.com/learn2step/radio-set',
            fetchPlaylistInfo: vi.fn().mockReturnValue({ pipe: () => ({ subscribe: (observer: { next: () => void }) => observer.next() }) }),
            getWidgetUrl: vi.fn().mockReturnValue('https://w.soundcloud.com/player/'),
            createWidget: vi.fn().mockResolvedValue(widget),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RadioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the station and active Radio tab', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Learn 2 Step Radio');
    expect(element.querySelector('.tab-item.active span')?.textContent).toContain('Radio');
    expect(element.querySelector('.tab-item.active')?.getAttribute('href')).toBe('/radio');
    expect(routes.some((route) => route.path === 'radio' && Boolean(route.loadComponent))).toBe(true);
  });

  it('toggles playback through the SoundCloud widget', () => {
    component.togglePlayback();
    expect(widget.play).toHaveBeenCalled();
    component.isPlaying.set(true);
    component.togglePlayback();
    expect(widget.pause).toHaveBeenCalled();
  });

  it('updates the seek position and formats time', () => {
    component.durationSeconds = 277_000;
    component.seekTo(145);
    expect(component.currentTimeLabel).toBe('2:25');
    expect(widget.seekTo).toHaveBeenCalledWith(145_000);
  });

  it('loads the playlist tracks and selects tracks for playback', () => {
    expect(component.soundCloudData()).toEqual(tracks);
    component.nextTrack();
    expect(widget.next).toHaveBeenCalled();
    component.openPlaylist();
  });
});
