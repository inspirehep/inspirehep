import { configure as configureTestingLibrary } from '@testing-library/react';
import 'jest-localstorage-mock';
import '@testing-library/jest-dom';

configureTestingLibrary({ asyncUtilTimeout: 3000 }); // Set timeout for waitFor to 3000ms (3 seconds)

jest.mock('rc-notification/lib/Notification');

// fix react-media
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

global.window.location = {
  origin: 'http://localhost:3000',
  host: 'localhost:3000',
  protocol: 'http:',
  port: '3000',
  hostname: 'localhost',
};
