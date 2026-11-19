import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AccountService } from '../auth/account.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, ReactiveFormsModule, RouterLink],
})
export class SignupPage {
  readonly loginUrl = this.accounts.loginUrl;
  get isConfigured(): boolean {
    return this.accounts.isConfigured;
  }
  readonly form = this.formBuilder.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: this.formBuilder.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z0-9_.]+$/),
        ],
        asyncValidators: [
          (control) =>
            timer(350).pipe(
              switchMap(() => this.accounts.isUsernameAvailable(String(control.value ?? ''))),
              map((available) => (available ? null : { usernameTaken: true })),
              catchError(() => [{ usernameCheckFailed: true }]),
            ),
        ],
        updateOn: 'blur',
      }),
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: SignupPage.passwordsMatch },
  );

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly accounts: AccountService,
    private readonly router: Router,
  ) {}

  static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmation = control.get('confirmPassword')?.value;
    return !confirmation || password === confirmation ? null : { passwordsMismatch: true };
  }

  get passwordStrength(): 'Weak' | 'Fair' | 'Strong' {
    const password = String(this.form.controls.password.value ?? '');
    let score = password.length >= 8 ? 1 : 0;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score <= 1 ? 'Weak' : score === 2 ? 'Fair' : 'Strong';
  }

  get passwordStrengthLevel(): number {
    const password = String(this.form.controls.password.value ?? '');
    if (!password) return 0;
    return this.passwordStrength === 'Strong' ? 3 : this.passwordStrength === 'Fair' ? 2 : 1;
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid || this.form.pending || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const { email, password, username } = this.form.getRawValue();
      const result = await this.accounts.createAccount({
        email: email ?? '',
        password: password ?? '',
        username: username ?? '',
      });
      if (result.emailConfirmationRequired) {
        this.successMessage = 'Account created. Check your email to confirm your account before logging in.';
        return;
      }

      this.successMessage = 'Your account is ready. Welcome to the community!';
      window.setTimeout(() => void this.router.navigateByUrl('/home'), 900);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not create your account right now. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
