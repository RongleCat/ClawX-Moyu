import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadProviderMode(mode?: string) {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_PROVIDER_MODE', mode ?? '');
  return await import('@/lib/provider-mode');
}

describe('provider mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to the full provider frontend mode when no env flag is set', async () => {
    const { getProviderMode, isMoyuMode } = await loadProviderMode();

    expect(getProviderMode()).toBe('default');
    expect(isMoyuMode()).toBe(false);
  });

  it('enables moyu mode when the env flag is set', async () => {
    const { getProviderMode, isMoyuMode } = await loadProviderMode('moyu');

    expect(getProviderMode()).toBe('moyu');
    expect(isMoyuMode()).toBe(true);
  });

  it('falls back to default mode for unknown env values', async () => {
    const { getProviderMode, isMoyuMode } = await loadProviderMode('something-else');

    expect(getProviderMode()).toBe('default');
    expect(isMoyuMode()).toBe(false);
  });
});
