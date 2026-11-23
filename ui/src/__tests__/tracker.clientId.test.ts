import { vi } from 'vitest';

const stubLocalStorage = (descriptor: PropertyDescriptor) =>
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    ...descriptor,
  });

describe('getClientId', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage'
  ) as PropertyDescriptor;
  let getClientId: () => string;

  beforeEach(async () => {
    // the in-memory fallback is module state
    vi.resetModules();
    ({ getClientId } = await import('../tracker'));
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    localStorage.clear();
  });

  it('generates, persists and reuses the id when storage works', () => {
    const id = getClientId();

    expect(id).toBeTruthy();
    expect(localStorage.getItem('clientId')).toBe(id);
    expect(getClientId()).toBe(id);
  });

  it('returns the stored id if there is one', () => {
    localStorage.setItem('clientId', 'stored-id');

    expect(getClientId()).toBe('stored-id');
  });

  it.each([
    [
      'access is denied (SecurityError)',
      () => {
        throw new DOMException('Access is denied', 'SecurityError');
      },
    ],
    [
      'it is not defined (ReferenceError)',
      () => {
        throw new ReferenceError("Can't find variable: localStorage");
      },
    ],
  ])('does not throw and keeps a stable id when %s', (_, get) => {
    stubLocalStorage({ get });

    const id = getClientId();

    expect(id).toBeTruthy();
    expect(getClientId()).toBe(id);
  });

  it('does not throw and keeps a stable id when it is null (WebView)', () => {
    stubLocalStorage({ get: () => null });

    const id = getClientId();

    expect(id).toBeTruthy();
    expect(getClientId()).toBe(id);
  });
});
