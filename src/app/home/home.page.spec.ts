import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AccountService } from '../auth/account.service';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let account: AccountService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    account = TestBed.inject(AccountService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the Create Account link while signed out', () => {
    expect(fixture.nativeElement.querySelector('.create-account-cta')?.textContent).toContain('Create Account');
    expect(fixture.nativeElement.querySelector('.login-cta')?.getAttribute('href')).toBe('/login');
  });

  it('hides the Create Account link while signed in', () => {
    account.isLoggedIn.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.create-account-cta')).toBeNull();
    expect(fixture.nativeElement.querySelector('.login-cta')).toBeNull();
    expect(fixture.nativeElement.querySelector('.signout-cta')?.textContent).toContain('Sign Out');
  });

  it('signs out through the account service', async () => {
    account.isLoggedIn.set(true);
    const signOut = vi.spyOn(account, 'signOut').mockResolvedValue();
    fixture.detectChanges();

    await fixture.nativeElement.querySelector('.signout-cta')?.click();

    expect(signOut).toHaveBeenCalled();
  });
});
