export interface GoogleUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  signedInAt: string;
  // 'google' = verified through Google Identity Services; 'local' = a
  // browser-only profile the user typed in, never authenticated anywhere.
  provider?: 'google' | 'local';
}

export const GOOGLE_CLIENT_ID = '20731269197-rsf5lqraj7apqjuvh5ph1ki5l6cqjfeh.apps.googleusercontent.com';

const AUTH_STORAGE_KEY = 'cyber_google_user_v1';

export function getStoredGoogleUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading google user from localStorage:', err);
    return null;
  }
}

export function saveGoogleUser(user: GoogleUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving google user to localStorage:', err);
  }
}

export interface GoogleJwtPayload {
  iss?: string;
  nbf?: number;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export function parseJwt(token: string): GoogleJwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT Token:', e);
    return null;
  }
}

function avatarFor(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Builds the session from the credential JWT that Google Identity Services
 * hands back. Returns null (and stores nothing) if the token can't be parsed
 * or carries no subject/email — we never invent an identity.
 */
export function createGoogleSessionFromCredential(credentialToken: string): GoogleUser | null {
  const payload = parseJwt(credentialToken);
  if (!payload?.sub || !payload.email) return null;

  const user: GoogleUser = {
    uid: payload.sub,
    displayName: payload.name || payload.email.split('@')[0],
    email: payload.email,
    photoURL: payload.picture || avatarFor(payload.email),
    signedInAt: new Date().toISOString(),
    provider: 'google',
  };

  saveGoogleUser(user);
  return user;
}

/**
 * Browser-only profile: a display name (and optional email, used only to seed
 * the avatar). Nothing is verified or sent anywhere; it just labels this
 * browser's watched list and history.
 */
export function createLocalProfile(name: string, email: string = ''): GoogleUser {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const user: GoogleUser = {
    uid: `local_${Math.random().toString(36).substring(2, 10)}`,
    displayName: cleanName,
    email: cleanEmail,
    photoURL: avatarFor(cleanEmail || cleanName),
    signedInAt: new Date().toISOString(),
    provider: 'local',
  };

  saveGoogleUser(user);
  return user;
}
