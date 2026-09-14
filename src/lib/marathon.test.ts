import { describe, it, expect } from 'vitest';
import { orderForMarathon, totalRuntimeMinutes, estimatedEndTime, formatMinutes, marathonToText } from './marathon';
import type { MovieDetails } from './tmdb';

const movie = (id: number, title: string, runtime: number | null, extra: Partial<MovieDetails> = {}): MovieDetails =>
  ({ id, title, runtime, release_date: '1999-03-31', vote_average: 8.3, ...extra }) as MovieDetails;

describe('marathon helpers', () => {
  const list = [movie(1, 'Short', 90), movie(2, 'Long', 150), movie(3, 'Unknown', null)];

  it('orders longest first and sums runtimes', () => {
    expect(orderForMarathon(list).map((m) => m.id)).toEqual([2, 1, 3]);
    expect(totalRuntimeMinutes(list)).toBe(240);
  });

  it('estimates the end time with breaks between movies', () => {
    const start = new Date('2026-09-14T21:00:00Z');
    expect(estimatedEndTime(list, start, 15).toISOString()).toBe('2026-09-15T01:30:00.000Z');
    expect(estimatedEndTime([], start).getTime()).toBe(start.getTime());
  });

  it('formats minutes and renders a pasteable list', () => {
    expect(formatMinutes(150)).toBe('2h 30m');
    expect(formatMinutes(45)).toBe('45m');
    expect(marathonToText(list.slice(0, 2), 'Maratón')).toBe('Maratón\n1. Short (1999) — 1h 30m — ⭐ 8.3\n2. Long (1999) — 2h 30m — ⭐ 8.3');
  });
});
