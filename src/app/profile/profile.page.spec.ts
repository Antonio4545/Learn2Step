import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { routes } from '../app.routes';
import { AccountService } from '../auth/account.service';
import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let component: ProfilePage;
  const accounts = {
    currentUsername: () => null,
    signOut: vi.fn(),
    saveProfilePhoto: vi.fn().mockResolvedValue('https://example.com/avatar.png'),
    getCurrentProfile: vi.fn().mockResolvedValue({
      username: 'dancer_21',
      email: 'dancer@example.com',
      location: null,
      avatarUrl: null,
      isVip: false,
      memberSince: 'Jan 2025',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: accounts },
        { provide: ActionSheetController, useValue: { create: vi.fn() } },
        { provide: AlertController, useValue: { create: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the Supabase account, stats placeholders, menu, and active Profile tab', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Profile');
    expect(element.querySelector('.identity-details h2')?.textContent).toContain('dancer_21');
    expect(element.querySelector('.profile-email')?.textContent).toContain('dancer@example.com');
    expect(element.querySelector('.member-since')?.textContent).toContain('Jan 2025');
    expect(Array.from(element.querySelectorAll('.stat strong')).map((node) => node.textContent?.trim())).toEqual(['—', '—', '—']);
    expect(element.querySelectorAll('.profile-menu button')).toHaveLength(4);
    expect(element.querySelector('.tab-item.active span')?.textContent).toContain('Profile');
    expect(element.querySelector('.tab-item.active')?.getAttribute('href')).toBe('/profile');
    expect(routes.some((route) => route.path === 'profile' && Boolean(route.loadComponent))).toBe(true);
  });

  it('saves a selected profile photo and updates the displayed account avatar', async () => {
    const input = { files: [new File(['photo'], 'avatar.png', { type: 'image/png' })], value: 'avatar.png' };
    await component.updateAvatar({ target: input } as unknown as Event);

    expect(accounts.saveProfilePhoto).toHaveBeenCalledWith(input.files[0]);
    expect(component.profile()?.avatarUrl).toBe('https://example.com/avatar.png');
    expect(input.value).toBe('');
  });
});
