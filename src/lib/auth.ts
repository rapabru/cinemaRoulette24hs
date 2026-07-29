export interface GoogleUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  signedInAt: string;
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

/**
 * Perform Google Sign-In login flow from official credential JWT token
 */
export function createGoogleSessionFromCredential(credentialToken: string): GoogleUser {
  const payload = parseJwt(credentialToken);
  const email = payload?.email || 'usuario.google@gmail.com';
  const name = payload?.name || email.split('@')[0];
  const picture = payload?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

  const user: GoogleUser = {
    uid: payload?.sub || `google_uid_${Math.random().toString(36).substring(2, 10)}`,
    displayName: name,
    email: email,
    photoURL: picture,
    signedInAt: new Date().toISOString(),
  };

  saveGoogleUser(user);
  return user;
}

/**
 * Perform fallback / manual Google login session
 */
export function createGoogleSession(email: string = 'usuario.cyber@gmail.com', name?: string, avatarUrl?: string): GoogleUser {
  const cleanEmail = email.trim().toLowerCase();
  const userName = name || cleanEmail.split('@')[0].replace('.', ' ');
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const avatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

  const user: GoogleUser = {
    uid: `google_uid_${Math.random().toString(36).substring(2, 10)}`,
    displayName: capitalizedName,
    email: cleanEmail,
    photoURL: avatar,
    signedInAt: new Date().toISOString(),
  };

  saveGoogleUser(user);
  return user;
}
