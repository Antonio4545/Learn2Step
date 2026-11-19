import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { AccountService } from '../auth/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, ReactiveFormsModule, RouterLink],
})
export class LoginPage {
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly accounts: AccountService,
    private readonly router: Router,
  ) {}

  async submit(): Promise<void> {
    this.errorMessage = '';
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const { email, password } = this.form.getRawValue();
      await this.accounts.signIn({ email: email ?? '', password: password ?? '' });
      await this.router.navigateByUrl('/profile');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not log you in. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
