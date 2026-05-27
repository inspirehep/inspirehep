import { vi } from 'vitest';

// Polyfill `jest` global so jest-* packages (jest-localstorage-mock, etc.)
// work under Vitest. This file must be listed FIRST in vitest setupFiles so
// the global is set before those packages are imported.
globalThis.jest = vi;
