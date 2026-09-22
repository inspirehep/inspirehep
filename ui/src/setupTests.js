import { vi } from 'vitest';
import { configure as configureTestingLibrary } from '@testing-library/react';
import 'jest-localstorage-mock';
import '@testing-library/jest-dom';

vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children, height }) => {
      const { cloneElement, Children } = require('react');
      return cloneElement(Children.only(children), { width: 800, height });
    },
  };
});

configureTestingLibrary({ asyncUtilTimeout: 3000 }); // Set timeout for waitFor to 3000ms (3 seconds)

vi.mock('rc-notification/lib/Notification');

// JSDOM doesn't implement getComputedStyle with a pseudo-element argument,
// which rc-util's scrollbar measurement (used by antd's Table) relies on. Drop
// the pseudo-element so it falls back to the element's computed style instead
// of emitting a "Not implemented: window.getComputedStyle(elt, pseudoElt)"
// jsdomError on every test that renders a Table.
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element) => originalGetComputedStyle(element);

window.scrollTo = vi.fn();

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

window.CONFIG = {};
