import { Injectable } from '@angular/core';
import { AuthResult } from '../models/auth.model';

/** Persisted session payload (token + resolved user + expiry). */
export interface PersistedSession {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  user: AuthResult['user'];
}

/**
 * Persists the session across page reloads.
 *
 * Decision (documented): the contract exposes no `/me` or token-refresh
 * endpoint, so the portal cannot re-hydrate the user from the server at
 * bootstrap. Instead we persist the resolved session (token + user) in
 * `localStorage` (mirrored in memory) and restore it on load; an expired or
 * revoked token is caught lazily when the first API call returns 401 (the
 * error interceptor then clears the session). This is an accepted tradeoff for
 * an internal admin app. All storage access goes through this service, so the
 * mechanism is swappable in one place.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private static readonly KEY = 'iams.auth.session';
  private memory: PersistedSession | null = null;
  private loaded = false;

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  getSession(): PersistedSession | null {
    if (this.loaded) {
      return this.memory;
    }
    this.loaded = true;
    try {
      const raw = localStorage.getItem(TokenStorageService.KEY);
      this.memory = raw ? (JSON.parse(raw) as PersistedSession) : null;
    } catch {
      // localStorage/JSON can throw (private mode, corrupt value) — treat as no session.
      this.memory = null;
    }
    return this.memory;
  }

  setSession(session: PersistedSession): void {
    this.memory = session;
    this.loaded = true;
    try {
      localStorage.setItem(TokenStorageService.KEY, JSON.stringify(session));
    } catch {
      // Ignore persistence failure; in-memory copy still serves this session.
    }
  }

  clear(): void {
    this.memory = null;
    this.loaded = true;
    try {
      localStorage.removeItem(TokenStorageService.KEY);
    } catch {
      // No-op.
    }
  }
}
