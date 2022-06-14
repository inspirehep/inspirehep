import { configure } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import Adapter from 'enzyme-adapter-react-16';
import { createSerializer } from 'enzyme-to-json';
import 'jest-localstorage-mock';
import 'jest-enzyme';

configure({ adapter: new Adapter() });

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }));

/* eslint-disable */
// mock so that `react-quill` works with `mount`
// https://github.com/zenoamaro/react-quill/issues/434
global.MutationObserver = class {
  constructor(callback: any) {}
  disconnect() {}
  observe(element: any, initObject: any) {}
  takeRecords() {
    return [];
  }
};
// @ts-expect-error ts-migrate(2322) FIXME: Type '() => void' is not assignable to type '() =>... Remove this comment to see the full error message
global.document.getSelection = function() {};
// @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
global.CONFIG = {};
global.scrollTo = () => {};

// fix react-media
// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
global.window.matchMedia = jest.fn().mockImplementation((query: any) => ({
  matches: false,
  media: query,
  onchange: null,

  // deprecated
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  addListener: jest.fn(),

  // deprecated
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  removeListener: jest.fn(),

  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  addEventListener: jest.fn(),
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  removeEventListener: jest.fn(),
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  dispatchEvent: jest.fn()
}));

// @ts-expect-error ts-migrate(2322) FIXME: Type '{ origin: string; host: string; protocol: st... Remove this comment to see the full error message
global.window.location = {
  origin: 'http://localhost:3000',
  host: 'localhost:3000',
  protocol: 'http:',
  port: '3000',
  hostname: 'localhost',
};
