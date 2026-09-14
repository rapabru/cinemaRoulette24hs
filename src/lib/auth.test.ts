import { describe, it, expect, beforeEach } from 'vitest';
import { createGoogleSessionFromCredential, createLocalProfile, getStoredGoogleUser, parseJwt } from './auth';
import { installMemoryStorage } from './test-utils';

const b64url = (obj: object) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fakeJwt = (payload: object) => `${b64url({ alg: 'RS256' })}.${b64url(payload)}.sig`;

describe('auth', () => {
  beforeEach(installMemoryStorage);

  it('parses the payload of a Google credential JWT', () => {
    expect(parseJwt(fakeJwt({ sub: '123', email: 'a@b.com' }))).toEqual({ sub: '123', email: 'a@b.com' });
    expect(parseJwt('not-a-jwt')).toBeNull();
  });

  it('creates a google session only from a credential with subject and email', () => {
    const user = createGoogleSessionFromCredential(fakeJwt({ sub: '42', email: 'ana@gmail.com', name: 'Ana', picture: 'https://p/x.png' }));
    expect(user).toMatchObject({ uid: '42', email: 'ana@gmail.com', displayName: 'Ana', photoURL: 'https://p/x.png', provider: 'google' });
    expect(getStoredGoogleUser()?.uid).toBe('42');
  });

  it('never invents an identity when the credential is unusable', () => {
    expect(createGoogleSessionFromCredential(fakeJwt({ name: 'no subject' }))).toBeNull();
    expect(createGoogleSessionFromCredential('garbage')).toBeNull();
    expect(getStoredGoogleUser()).toBeNull();
  });

  it('creates a clearly labelled local profile', () => {
    const user = createLocalProfile('  Alex  ', 'Alex@Example.com');
    expect(user.provider).toBe('local');
    expect(user.uid.startsWith('local_')).toBe(true);
    expect(user.displayName).toBe('Alex');
    expect(user.email).toBe('alex@example.com');
    expect(getStoredGoogleUser()?.provider).toBe('local');
  });
});
