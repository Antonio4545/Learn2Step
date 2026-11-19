import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward } from 'ionicons/icons';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  imports: [IonContent, IonIcon],
})
export class OnboardingPage {
  constructor(private readonly router: Router) {
    addIcons({ arrowForward });
    void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  }

  onGetStarted(): void {
    void this.router.navigateByUrl('/home');
  }
}
