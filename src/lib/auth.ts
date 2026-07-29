export interface GoogleUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  signedInAt: string;
}

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

/**
 * Perform Google Sign-In login flow
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
