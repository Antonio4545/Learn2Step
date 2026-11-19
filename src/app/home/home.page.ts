import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonFooter, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { AccountService } from '../auth/account.service';
import { Learn2StepLogoComponent } from '../shared/learn2step-logo.component';
import {
  add,
  ellipsisVertical,
  home,
  menuOutline,
  notificationsOutline,
  personOutline,
  playCircleOutline,
  radioOutline,
  ribbonOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonFooter, IonHeader, IonIcon, IonToolbar, Learn2StepLogoComponent, RouterLink],
})
export class HomePage {
  readonly account = inject(AccountService);
  signOutError = '';

  constructor() {
    addIcons({
      add,
      ellipsisVertical,
      home,
      menuOutline,
      notificationsOutline,
      personOutline,
      playCircleOutline,
      radioOutline,
      ribbonOutline,
    });
  }

  async signOut(): Promise<void> {
    this.signOutError = '';
    try {
      await this.account.signOut();
    } catch (error) {
      this.signOutError = error instanceof Error ? error.message : 'We could not log you out. Please try again.';
    }
  }
}
