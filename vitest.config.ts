import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts so the app build doesn't pull in vitest,
// and tests don't pull in the React/Tailwind plugins they never need.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
