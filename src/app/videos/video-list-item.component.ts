import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { ellipsisVertical } from 'ionicons/icons';

export interface VideoItem {
  title: string;
  instructor: string;
  category: string;
  duration: string;
  image: string;
}

@Component({
  selector: 'app-video-list-item',
  template: `
    <article class="video-card">
      <button class="video-open" type="button" [attr.aria-label]="'Play ' + video().title" (click)="opened.emit(video())">
        <span class="thumbnail-wrap"><img [src]="video().image" [alt]="video().title + ' preview'" /><span class="duration">{{ video().duration }}</span></span>
        <span class="video-detail"><strong>{{ video().title }}</strong><span>{{ video().instructor }}</span></span>
      </button>
      <button class="video-menu" type="button" aria-label="More video options" (click)="menu.emit(video())"><ion-icon name="ellipsis-vertical"></ion-icon></button>
    </article>
  `,
  styleUrl: './video-list-item.component.scss',
  imports: [IonIcon],
})
export class VideoListItemComponent {
  readonly video = input.required<VideoItem>();
  readonly opened = output<VideoItem>();
  readonly menu = output<VideoItem>();

  constructor() { addIcons({ ellipsisVertical }); }
}
