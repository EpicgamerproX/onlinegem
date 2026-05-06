import { isSupabaseConfigured, supabase } from './supabaseClient.js';

export class AuthManager {
  constructor() {
    this.overlay = null;
    this.statusEl = null;
    this.mode = 'sign-in';
    this.profileOnlyUser = null;
    this.resolveProfileReady = null;
  }

  async init() {
    this.createOverlay();

    if (!isSupabaseConfigured) {
      this.setStatus('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to start online play.');
      this.overlay.classList.add('is-visible');
      throw new Error('Supabase is not configured');
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const profile = await this.ensureProfile(data.session.user);
      this.destroyOverlay();
      return { session: data.session, profile };
    }

    this.overlay.classList.add('is-visible');
    return new Promise(resolve => {
      this.resolveReady = resolve;
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'auth-overlay';
    this.overlay.innerHTML = `
      <form id="auth-panel" autocomplete="on">
        <div class="auth-kicker">Signal Lost: Office</div>
        <h1>Enter the office</h1>
        <div class="auth-tabs" role="tablist">
          <button type="button" data-mode="sign-in" class="active">Sign in</button>
          <button type="button" data-mode="sign-up">Sign up</button>
        </div>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Password<input name="password" type="password" required minlength="6" autocomplete="current-password"></label>
        <div class="profile-fields">
          <label>Username<input name="username" type="text" minlength="3" maxlength="24" pattern="[a-zA-Z0-9_]+" autocomplete="username"></label>
          <label>Display name<input name="display_name" type="text" maxlength="40" autocomplete="name"></label>
        </div>
        <button class="auth-submit" type="submit">Continue</button>
        <p class="auth-status" aria-live="polite"></p>
      </form>
    `;

    this.overlay.addEventListener('click', event => event.stopPropagation());
    this.overlay.querySelectorAll('[data-mode]').forEach(button => {
      button.addEventListener('click', () => this.setMode(button.dataset.mode));
    });
    this.overlay.querySelector('form').addEventListener('submit', event => this.handleSubmit(event));
    this.statusEl = this.overlay.querySelector('.auth-status');
    document.body.appendChild(this.overlay);
    this.setMode('sign-in');
  }

  setMode(mode) {
    this.mode = mode;
    this.overlay.querySelectorAll('[data-mode]').forEach(button => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    this.overlay.classList.toggle('needs-profile', mode === 'sign-up');
    this.overlay.querySelector('[name="password"]').autocomplete = mode === 'sign-in'
      ? 'current-password'
      : 'new-password';
    this.setStatus('');
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (this.profileOnlyUser) {
      await this.handleProfileOnlySubmit(form, formData);
      return;
    }

    const email = String(formData.get('email')).trim();
    const password = String(formData.get('password'));
    const username = String(formData.get('username') || '').trim();
    const displayName = String(formData.get('display_name') || '').trim();

    form.querySelector('.auth-submit').disabled = true;
    this.setStatus(this.mode === 'sign-in' ? 'Signing in...' : 'Creating profile...');

    try {
      const authResult = this.mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authResult.error) throw authResult.error;

      const session = authResult.data.session || (await supabase.auth.getSession()).data.session;
      if (!session) {
        this.setStatus('Check your email to confirm your account, then sign in.');
        return;
      }

      if (this.mode === 'sign-up') {
        await this.saveProfile(session.user.id, username, displayName);
      }

      const profile = await this.ensureProfile(session.user);
      this.destroyOverlay();
      this.resolveReady({ session, profile });
    } catch (error) {
      this.setStatus(this.cleanError(error.message));
    } finally {
      form.querySelector('.auth-submit').disabled = false;
    }
  }

  async ensureProfile(user) {
    const { data, error } = await supabase
      .from('game_profiles')
      .select('user_id, username, display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    this.profileOnlyUser = user;
    this.overlay.classList.add('is-visible', 'needs-profile', 'profile-only');
    this.overlay.querySelectorAll('[name="email"], [name="password"]').forEach(input => {
      input.disabled = true;
      input.required = false;
    });
    this.setStatus('Choose a unique username and display name to finish setup.');
    return new Promise(resolve => {
      this.resolveProfileReady = resolve;
    });
  }

  async handleProfileOnlySubmit(form, formData) {
    form.querySelector('.auth-submit').disabled = true;
    try {
      const username = String(formData.get('username') || '').trim();
      const displayName = String(formData.get('display_name') || '').trim();
      await this.saveProfile(this.profileOnlyUser.id, username, displayName);
      const profile = await this.fetchProfile(this.profileOnlyUser.id);
      this.profileOnlyUser = null;
      this.destroyOverlay();
      this.resolveProfileReady(profile);
    } catch (error) {
      this.setStatus(this.cleanError(error.message));
    } finally {
      form.querySelector('.auth-submit').disabled = false;
    }
  }

  async fetchProfile(userId) {
    const { data, error } = await supabase
      .from('game_profiles')
      .select('user_id, username, display_name')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async saveProfile(userId, username, displayName) {
    if (!username || !displayName) {
      throw new Error('Username and display name are required.');
    }

    const { error } = await supabase.from('game_profiles').insert({
      user_id: userId,
      username,
      display_name: displayName
    });

    if (error) throw error;
  }

  setStatus(message) {
    if (this.statusEl) this.statusEl.textContent = message;
  }

  cleanError(message) {
    if (message.includes('duplicate') || message.includes('unique')) {
      return 'That username is already taken.';
    }
    return message;
  }

  destroyOverlay() {
    this.overlay?.remove();
    this.overlay = null;
  }
}
