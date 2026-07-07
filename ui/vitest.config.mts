import { defineConfig, mergeConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import viteConfig from './vite.config.mts';

const SVG_MOCK = fileURLToPath(
  new URL('./src/__mocks__/SvgMock.jsx', import.meta.url)
);

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: [
        // Only redirect ?react SVG imports to a stub component.
        // vite-plugin-svgr doesn't run in the jsdom/Node test environment,
        // so ReactComponent would otherwise be undefined.
        // Plain `import url from './icon.svg'` imports are handled natively
        // by Vite (returns the file path as a string) and need no mock.
        { find: /^.*\.svg\?react.*$/, replacement: SVG_MOCK },
      ],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      env: {
        TZ: 'UTC',
      },
      setupFiles: ['./src/jest-polyfill.js', './src/setupTests.js'],
      server: {
        deps: {
          inline: ['antd', /^rc-/],
        },
      },
      clearMocks: false,
      resetMocks: false,
      restoreMocks: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx,js,jsx}'],
        exclude: [
          'src/**/__tests__/**',
          'src/**/*.test.*',
          'src/**/*.spec.*',
          'src/setupTests.js',
          'src/registerServiceWorker.js',
        ],
      },
    },
  })
);
