import type { MovieDetails } from './tmdb';

// Helpers for "modo maratón": a batch of drawn movies for one night.

export const MARATHON_BREAK_MINUTES = 15;

/** Longest first: watch the demanding one while everyone is still awake. */
export function orderForMarathon(movies: MovieDetails[]): MovieDetails[] {
  return [...movies].sort((a, b) => (b.runtime || 0) - (a.runtime || 0));
}

export function totalRuntimeMinutes(movies: MovieDetails[]): number {
  return movies.reduce((sum, m) => sum + (m.runtime || 0), 0);
}

/** When the night ends if it starts now, counting a break between movies. */
export function estimatedEndTime(movies: MovieDetails[], start: Date = new Date(), breakMinutes: number = MARATHON_BREAK_MINUTES): Date {
  const breaks = Math.max(0, movies.length - 1) * breakMinutes;
  return new Date(start.getTime() + (totalRuntimeMinutes(movies) + breaks) * 60_000);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** Plain-text list ready to paste in a chat. */
export function marathonToText(movies: MovieDetails[], heading: string): string {
  const lines = movies.map((m, i) => {
    const year = m.release_date ? m.release_date.slice(0, 4) : '';
    const bits = [`${i + 1}. ${m.title}${year ? ` (${year})` : ''}`];
    if (m.runtime) bits.push(formatMinutes(m.runtime));
    if (m.vote_average > 0) bits.push(`⭐ ${m.vote_average.toFixed(1)}`);
    return bits.join(' — ');
  });
  return [heading, ...lines].join('\n');
}
