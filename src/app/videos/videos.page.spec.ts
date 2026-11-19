import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { VideosPage } from './videos.page';

describe('VideosPage', () => {
  let fixture: ComponentFixture<VideosPage>;
  let component: VideosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideosPage],
      providers: [
        provideRouter([]),
        { provide: ActionSheetController, useValue: { create: vi.fn() } },
        { provide: AlertController, useValue: { create: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the Videos page with category chips and video items', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Videos');
    expect(fixture.nativeElement.querySelectorAll('app-filter-chip')).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('app-video-list-item')).toHaveLength(2);
  });

  it('filters the list when a category is selected', () => {
    component.setFilter('West Coast');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-video-list-item')).toHaveLength(1);
    expect(component.filteredVideos[0].title).toBe('West Coast Smooth Walkthrough');
  });

  it('filters videos by search text', () => {
    component.searchTerm = 'Professor';

    expect(component.filteredVideos).toHaveLength(0);
    component.setFilter('Heavy Hitters');
    expect(component.filteredVideos).toHaveLength(1);
    expect(component.filteredVideos[0].instructor).toBe('with The Step Professor');
  });
});
