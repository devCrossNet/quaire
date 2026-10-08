import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.ts', 'examples/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'examples/**/*.ts'],
      exclude: ['**/*.{test,spec}.ts', 'src/types.ts', 'src/index.ts'],
      reportsDirectory: './coverage',
      reporter: ['html', 'text', 'lcov', 'json'],
      thresholds: {
        100: true,
      },
    },
  },
});
