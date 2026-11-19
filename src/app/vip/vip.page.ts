import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Learn2StepLogoComponent } from '../shared/learn2step-logo.component';
import { chevronBack, ellipsisVertical, lockClosed, search } from 'ionicons/icons';

interface VipLesson {
  title: string;
  instructor: string;
  duration: string;
  image: string;
  isLocked: boolean;
}

@Component({
  selector: 'app-vip',
  templateUrl: './vip.page.html',
  styleUrls: ['./vip.page.scss'],
  imports: [CommonModule, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar, Learn2StepLogoComponent, RouterLink],
})
export class VipPage {
  readonly filters = ['All', 'Footwork', 'Partnering', 'Routines'];
  readonly lessons: VipLesson[] = [
    {
      title: 'Foundations of Chicago Stepping',
      instructor: 'with Darnell & Keisha',
      duration: '10:24',
      // TODO: Replace placeholder with the approved Foundations lesson thumbnail.
      image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=480&q=80',
      isLocked: false,
    },
    {
      title: 'Advanced Turns & Transitions',
      instructor: 'with Marcus & Tanya',
      duration: '22:17',
      // TODO: Replace placeholder with the approved Advanced Turns lesson thumbnail.
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=80',
      isLocked: true,
    },
    {
      title: 'Smooth Flow & Connection',
      instructor: 'with Reggie & Nia',
      duration: '20:08',
      // TODO: Replace placeholder with the approved Smooth Flow lesson thumbnail.
      image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=480&q=80',
      isLocked: true,
    },
  ];

  constructor() {
    addIcons({ chevronBack, ellipsisVertical, lockClosed, search });
  }

  onFilterTap(filter: string): void {
    // TODO: Apply category filtering when lesson categories are connected.
    void filter;
  }

  onSearchTap(): void {
    // TODO: Connect search when lesson search is implemented.
  }

  onUnlockTap(): void {
    // TODO: Connect the VIP subscription or lesson access flow.
  }
}
