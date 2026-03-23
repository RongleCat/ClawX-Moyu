import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      if (name === 'appData') return '/tmp/appdata';
      if (name === 'userData') return '/tmp/appdata/OneKeyClaw';
      return '/tmp';
    },
    isPackaged: false,
  },
}));

vi.mock('os', async () => {
  const actual = await vi.importActual<typeof import('os')>('os');
  const mocked = {
    ...actual,
    homedir: () => '/tmp/home',
  };
  return {
    ...mocked,
    default: mocked,
  };
});

describe('path utilities branding paths', () => {
  it('resolves the app config directory under ~/.onekeyclaw', async () => {
    const { getClawXConfigDir } = await import('@electron/utils/paths');
    expect(getClawXConfigDir()).toBe('/tmp/home/.onekeyclaw');
  });

  it('reads userData-backed data and logs directories from the OneKeyClaw app data path', async () => {
    const { getDataDir, getLogsDir } = await import('@electron/utils/paths');
    expect(getDataDir()).toBe('/tmp/appdata/OneKeyClaw');
    expect(getLogsDir()).toBe('/tmp/appdata/OneKeyClaw/logs');
  });
});
