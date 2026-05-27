import { vi } from 'vitest';
import { configure as configureTestingLibrary } from '@testing-library/react';
import 'jest-localstorage-mock';
import '@testing-library/jest-dom';

configureTestingLibrary({ asyncUtilTimeout: 3000 }); // Set timeout for waitFor to 3000ms (3 seconds)

vi.mock('rc-notification/lib/Notification');

window.matchMedia = (query) => ({
  matches: query.includes('min-width: 1200px') || query === 'all',
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

global.window.location = {
  origin: 'http://localhost:3000',
  host: 'localhost:3000',
  protocol: 'http:',
  port: '3000',
  hostname: 'localhost',
};
