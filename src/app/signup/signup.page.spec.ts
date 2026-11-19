import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../app.routes';
import { AccountService } from '../auth/account.service';
import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let fixture: ComponentFixture<SignupPage>;
  let component: SignupPage;
  let account: {
    isLoggedIn: ReturnType<typeof signal<boolean>>;
    loginUrl: string;
    isConfigured: boolean;
    isUsernameAvailable: ReturnType<typeof vi.fn>;
    createAccount: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    account = {
      isLoggedIn: signal(false),
      loginUrl: 'https://example.com/login',
      isConfigured: true,
      isUsernameAvailable: vi.fn().mockResolvedValue(true),
      createAccount: vi.fn().mockResolvedValue({ emailConfirmationRequired: true }),
    };

    await TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [provideRouter([]), { provide: AccountService, useValue: account }],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('registers the create-account route', () => {
    expect(routes.some((route) => route.path === 'create-account' && Boolean(route.loadComponent))).toBe(true);
  });

  it('renders the required signup fields and login link', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#signup-email')).toBeTruthy();
    expect(element.querySelector('#signup-username')).toBeTruthy();
    expect(element.querySelector('#signup-password')).toBeTruthy();
    expect(element.querySelector('#signup-confirm-password')).toBeTruthy();
    expect(element.querySelector('.login-prompt a')?.getAttribute('href')).toBe('/login');
  });

  it('validates email, password length, and password confirmation', () => {
    component.form.controls.email.setValue('not-an-email');
    component.form.controls.password.setValue('short');
    component.form.controls.confirmPassword.setValue('different');
    component.form.updateValueAndValidity();

    expect(component.form.controls.email.invalid).toBe(true);
    expect(component.form.controls.password.hasError('minlength')).toBe(true);
    expect(component.form.hasError('passwordsMismatch')).toBe(true);
  });

  it('submits valid registration details and shows the confirmation message', async () => {
    component.form.controls.email.setValue('stepper@example.com');
    component.form.controls.username.setValue('StepDancer');
    component.form.controls.password.setValue('StrongDance123!');
    component.form.controls.confirmPassword.setValue('StrongDance123!');
    await fixture.whenStable();

    await component.submit();

    expect(account.createAccount).toHaveBeenCalledWith({
      email: 'stepper@example.com',
      password: 'StrongDance123!',
      username: 'StepDancer',
    });
    expect(component.successMessage).toContain('Check your email');
  });

  it('shows server errors without throwing from submit', async () => {
    account.createAccount.mockRejectedValue(new Error('That username is already taken. Please choose another.'));
    component.form.controls.email.setValue('stepper@example.com');
    component.form.controls.username.setValue('StepDancer');
    component.form.controls.password.setValue('StrongDance123!');
    component.form.controls.confirmPassword.setValue('StrongDance123!');
    await fixture.whenStable();

    await component.submit();

    expect(component.errorMessage).toContain('already taken');
  });

  it('redirects to Home when signup returns a session', async () => {
    account.createAccount.mockResolvedValue({ emailConfirmationRequired: false });
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    vi.useFakeTimers();
    component.form.controls.email.setValue('stepper@example.com');
    component.form.controls.username.setValue('StepDancer');
    component.form.controls.password.setValue('StrongDance123!');
    component.form.controls.confirmPassword.setValue('StrongDance123!');
    await fixture.whenStable();

    await component.submit();
    vi.advanceTimersByTime(900);

    expect(navigation).toHaveBeenCalledWith('/home');
    vi.useRealTimers();
  });
});
