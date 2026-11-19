import { Injectable, signal } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface CreateAccountInput {
  email: string;
  password: string;
  username: string;
}

export interface CreateAccountResult {
  emailConfirmationRequired: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AccountProfile {
  username: string;
  email: string;
  location: string | null;
  avatarUrl: string | null;
  isVip: boolean;
  memberSince: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  readonly isLoggedIn = signal(false);
  readonly currentUsername = signal<string | null>(null);
  readonly loginUrl = environment.loginUrl;
  private readonly client: SupabaseClient | null =
    environment.supabaseUrl && environment.supabaseAnonKey
      ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
      : null;

  constructor() {
    if (!this.client) return;

    void this.client.auth.getSession().then(({ data }) => this.updateSession(data.session));
    this.client.auth.onAuthStateChange((_event, session) => this.updateSession(session));
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const client = this.requireClient();
    const { data, error } = await client.rpc('is_username_available', {
      candidate_username: username.trim().toLowerCase(),
    });

    if (error) throw new Error('We could not check that username. Please try again.');
    return data === true;
  }

  async createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { username: input.username.trim().toLowerCase() } },
    });

    if (error) {
      if (error.code === '23505' || /username.*(taken|duplicate|unique)/i.test(error.message)) {
        throw new Error('That username is already taken. Please choose another.');
      }
      if (/already registered|already exists/i.test(error.message)) {
        throw new Error('An account with that email may already exist. Try logging in.');
      }
      throw new Error('We could not create your account right now. Please try again.');
    }

    return { emailConfirmationRequired: !data.session };
  }

  async signIn(input: LoginInput): Promise<void> {
    const { error } = await this.requireClient().auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Confirm your email using the link we sent before logging in.');
      }
      throw new Error('We could not log you in with those details. Check your email and password, then try again.');
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.requireClient().auth.signOut();
    if (error) throw new Error('We could not log you out. Please try again.');
  }

  async getCurrentProfile(): Promise<AccountProfile> {
    const client = this.requireClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) throw new Error('Log in to view your profile information.');

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('username, created_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    const metadata = authData.user.user_metadata ?? {};
    // Auth remains the source of truth when a legacy account has no profiles row,
    // or the optional profiles table has not been deployed to this Supabase project.
    const createdAt = profileError ? authData.user.created_at : profile?.created_at ?? authData.user.created_at;
    return {
      username: (!profileError ? profile?.username : null) ?? this.stringMetadata(metadata['username']) ?? authData.user.email?.split('@')[0] ?? 'Member',
      email: authData.user.email ?? '',
      location: this.stringMetadata(metadata['location']),
      avatarUrl: this.stringMetadata(metadata['avatar_url']),
      isVip: authData.user.app_metadata['is_vip'] === true,
      memberSince: createdAt
        ? new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(createdAt))
        : 'Unknown',
    };
  }

  async saveProfilePhoto(file: File): Promise<string> {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowedTypes.has(file.type)) throw new Error('Choose a JPG, PNG, WEBP, or GIF image.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Profile photos must be 5 MB or smaller.');

    const client = this.requireClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) throw new Error('Log in before saving a profile photo.');

    const path = `${authData.user.id}/avatar`;
    const bucket = client.storage.from('avatars');
    const { error: uploadError } = await bucket.upload(path, file, {
      cacheControl: '0',
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      if (/bucket.*not found/i.test(uploadError.message)) {
        throw new Error('The Supabase Storage bucket "avatars" was not found. Check its name and try again.');
      }
      if (/row-level security|not authorized|permission/i.test(uploadError.message)) {
        throw new Error('Supabase is blocking this upload. Add the authenticated-user upload and update policies for the "avatars" bucket.');
      }
      throw new Error('We could not save your photo. Please try again.');
    }

    const publicUrl = `${bucket.getPublicUrl(path).data.publicUrl}?updated=${Date.now()}`;
    const { error: updateError } = await client.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) throw new Error('Your photo uploaded, but we could not update your account. Please try again.');
    return publicUrl;
  }

  private stringMetadata(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private requireClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Account creation is not configured yet. Add the Supabase publishable key to the app environment.');
    }
    return this.client;
  }

  private updateSession(session: Awaited<ReturnType<SupabaseClient['auth']['getSession']>>['data']['session']): void {
    this.isLoggedIn.set(Boolean(session));
    const username = session?.user.user_metadata['username'];
    this.currentUsername.set(typeof username === 'string' && username.trim() ? username : null);
  }
}
