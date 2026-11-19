import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'vip',
    loadComponent: () => import('./vip/vip.page').then((m) => m.VipPage),
  },
  {
    path: 'videos',
    loadComponent: () => import('./videos/videos.page').then((m) => m.VideosPage),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'create-account',
    loadComponent: () => import('./signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'radio',
    loadComponent: () => import('./radio/radio.page').then((m) => m.RadioPage),
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];
