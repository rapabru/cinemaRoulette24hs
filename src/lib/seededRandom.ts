// Deterministic PRNG so a shared "sorteo de la noche" link makes everyone
// draw the same sequence of movies. Same seed + same filters → same picks.

/** cyrb53-style string hash: cheap, well distributed, good enough to seed a PRNG. */
export function hashString(input: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0) * 4294967296 + (h1 >>> 0);
}

/** mulberry32: returns a Math.random-compatible function for the given seed string. */
export function createSeededRng(seed: string): () => number {
  let state = hashString(seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to keep it readable aloud

/** Short, human-friendly seed for sharing in a chat ("ABC123"). */
export function generateSeed(length: number = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => SEED_ALPHABET[b % SEED_ALPHABET.length]).join('');
}
