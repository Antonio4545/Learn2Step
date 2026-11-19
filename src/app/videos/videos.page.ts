import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBack, home, personOutline, playCircle, radioOutline, ribbonOutline, search } from 'ionicons/icons';
import { FilterChipComponent } from './filter-chip.component';
import { VideoItem, VideoListItemComponent } from './video-list-item.component';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrl: './videos.page.scss',
  imports: [CommonModule, FilterChipComponent, FormsModule, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar, RouterLink, VideoListItemComponent],
})
export class VideosPage {
  readonly filters = ['Heavy Hitters', 'West Coast', 'East Coast', 'Central'];
  activeFilter = 'Heavy Hitters';
  searchTerm = '';
  readonly videos: VideoItem[] = [
    { title: 'Heavy Hitters: Classic Step Combo', instructor: 'with Big Steppa', category: 'Heavy Hitters', duration: '12:46', image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=640&q=80' },
    { title: 'West Coast Smooth Walkthrough', instructor: 'with Tasha & Mike', category: 'West Coast', duration: '08:32', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=640&q=80' },
    { title: 'East Coast Rhythm & Flow', instructor: 'with Coach L Boogie', category: 'East Coast', duration: '15:09', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=640&q=80' },
    { title: 'Central Style: Partner Connection', instructor: 'with Darnell & Keisha', category: 'Central', duration: '10:24', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=640&q=80' },
    { title: 'Heavy Hitters: Chicago Fundamentals', instructor: 'with The Step Professor', category: 'Heavy Hitters', duration: '18:21', image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=640&q=80' },
  ];

  constructor(private readonly actions: ActionSheetController, private readonly alerts: AlertController) {
    addIcons({ chevronBack, home, personOutline, playCircle, radioOutline, ribbonOutline, search });
  }

  get filteredVideos(): VideoItem[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    return this.videos.filter((video) => video.category === this.activeFilter && (!query || `${video.title} ${video.instructor}`.toLocaleLowerCase().includes(query)));
  }

  setFilter(filter: string): void { this.activeFilter = filter; }

  async openVideo(video: VideoItem): Promise<void> {
    const alert = await this.alerts.create({ header: video.title, message: 'Video player coming soon.', buttons: ['OK'] });
    await alert.present();
  }

  async openMenu(video: VideoItem): Promise<void> {
    const sheet = await this.actions.create({ header: video.title, buttons: [
      { text: 'Share', handler: () => this.showActionMessage('Share link copied.') },
      { text: 'Save', handler: () => this.showActionMessage('Video saved.') },
      { text: 'Report', role: 'destructive', handler: () => this.showActionMessage('Report submitted.') },
      { text: 'Cancel', role: 'cancel' },
    ] });
    await sheet.present();
  }

  private async showActionMessage(message: string): Promise<void> {
    const alert = await this.alerts.create({ message, buttons: ['OK'] });
    await alert.present();
  }
}
