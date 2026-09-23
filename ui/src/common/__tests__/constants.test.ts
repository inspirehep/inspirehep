import { vi } from 'vitest';

describe('LOCAL_TIMEZONE', () => {
  const mockResolvedTimeZone = (timeZone: string | undefined) => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone,
    } as Intl.ResolvedDateTimeFormatOptions);
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses the resolved timezone when it is known', async () => {
    mockResolvedTimeZone('Europe/Zurich');

    const { LOCAL_TIMEZONE } = await import('../constants');

    expect(LOCAL_TIMEZONE).toBe('Europe/Zurich');
  });

  it('falls back to UTC when the resolved timezone is Etc/Unknown', async () => {
    mockResolvedTimeZone('Etc/Unknown');

    const { LOCAL_TIMEZONE } = await import('../constants');

    expect(LOCAL_TIMEZONE).toBe('UTC');
  });

  it('falls back to UTC when no timezone can be resolved', async () => {
    mockResolvedTimeZone(undefined);

    const { LOCAL_TIMEZONE } = await import('../constants');

    expect(LOCAL_TIMEZONE).toBe('UTC');
  });
});
