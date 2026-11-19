import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  barChart,
  camera,
  chevronForward,
  heart,
  home,
  location,
  menuOutline,
  people,
  person,
  playCircle,
  play,
  radioOutline,
  ribbonOutline,
  settingsOutline,
  trophy,
} from 'ionicons/icons';
import { AccountProfile, AccountService } from '../auth/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [CommonModule, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar, RouterLink],
})
export class ProfilePage {
  private readonly account = inject(AccountService);
  private readonly actionSheets = inject(ActionSheetController);
  private readonly alerts = inject(AlertController);
  private readonly router = inject(Router);
  readonly profile = signal<AccountProfile | null>(null);
  readonly profileLoading = signal(true);
  readonly profileError = signal('');
  readonly photoUploading = signal(false);

  constructor() {
    addIcons({ barChart, camera, chevronForward, heart, home, location, menuOutline, people, person, play, playCircle, radioOutline, ribbonOutline, settingsOutline, trophy });
    void this.loadProfile();
  }

  get displayName(): string {
    return this.profile()?.username ?? this.account.currentUsername() ?? 'Your Profile';
  }

  get avatar(): string {
    return this.profile()?.avatarUrl || '';
  }

  async loadProfile(): Promise<void> {
    this.profileLoading.set(true);
    this.profileError.set('');
    try {
      this.profile.set(await this.account.getCurrentProfile());
    } catch (error) {
      this.profileError.set(error instanceof Error ? error.message : 'We could not load your profile.');
    } finally {
      this.profileLoading.set(false);
    }
  }

  async openMenu(): Promise<void> {
    const sheet = await this.actionSheets.create({ header: 'Menu', buttons: [
      { text: 'Home', handler: () => { void this.router.navigateByUrl('/home'); } },
      { text: 'Videos', handler: () => { void this.router.navigateByUrl('/videos'); } },
      { text: 'Sign Out', role: 'destructive', handler: () => this.signOut() },
      { text: 'Cancel', role: 'cancel' },
    ] });
    await sheet.present();
  }

  async openSettings(): Promise<void> {
    const sheet = await this.actionSheets.create({ header: 'Settings', buttons: [
      { text: 'Account settings', handler: () => this.showMessage('Account settings are coming soon.') },
      { text: 'Privacy settings', handler: () => this.showMessage('Privacy settings are coming soon.') },
      { text: 'Sign Out', role: 'destructive', handler: () => this.signOut() },
      { text: 'Cancel', role: 'cancel' },
    ] });
    await sheet.present();
  }

  async openProfileAction(action: string): Promise<void> {
    const messages: Record<string, string> = {
      'Saved Videos': 'Your saved videos will appear here.',
      'My Learning Progress': 'Your learning progress details are coming soon.',
      'Favorite Instructors': 'Your favorite instructors will appear here.',
      'My Posts & Activity': 'Your posts and activity will appear here.',
    };
    await this.showMessage(messages[action] ?? 'This section is coming soon.');
  }

  async updateAvatar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.profileError.set('');
    this.photoUploading.set(true);
    try {
      const avatarUrl = await this.account.saveProfilePhoto(file);
      this.profile.update((profile) => profile ? { ...profile, avatarUrl } : profile);
    } catch (error) {
      this.profileError.set(error instanceof Error ? error.message : 'We could not save your profile photo.');
    } finally {
      this.photoUploading.set(false);
    }
  }

  private async signOut(): Promise<void> {
    await this.account.signOut();
    await this.router.navigateByUrl('/home');
  }

  private async showMessage(message: string): Promise<void> {
    const alert = await this.alerts.create({ message, buttons: ['OK'] });
    await alert.present();
  }
}
