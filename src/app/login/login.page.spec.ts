import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AccountService } from '../auth/account.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  const accounts = { signIn: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    accounts.signIn.mockClear();
    accounts.signIn.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AccountService, useValue: accounts }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders email and password fields', () => {
    expect(fixture.nativeElement.querySelector('#login-email')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#login-password')).toBeTruthy();
  });

  it('authenticates with Supabase and navigates home', async () => {
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    component.form.setValue({ email: 'dancer@example.com', password: 'stepper-pass' });

    await component.submit();

    expect(accounts.signIn).toHaveBeenCalledWith({ email: 'dancer@example.com', password: 'stepper-pass' });
    expect(navigation).toHaveBeenCalledWith('/profile');
  });
});
