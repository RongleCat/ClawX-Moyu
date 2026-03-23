import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BUILTIN_PROVIDER_TYPES,
  getProviderConfig,
  getProviderEnvVar,
  getProviderEnvVars,
} from '@electron/utils/provider-registry';

async function loadProviders(mode?: string) {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_PROVIDER_MODE', mode ?? '');
  return await import('@/lib/providers');
}

describe('provider metadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('exposes the full source-project provider registry by default', async () => {
    const {
      PROVIDER_TYPES,
      PROVIDER_TYPE_INFO,
      getProviderDocsUrl,
      resolveProviderModelForSave,
      shouldShowProviderModelId,
    } = await loadProviders();

    expect(PROVIDER_TYPES).toContain('ark');
    expect(PROVIDER_TYPES).toContain('custom');
    expect(PROVIDER_TYPE_INFO.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['openai', 'google', 'ark', 'moonshot', 'custom'])
    );

    const custom = PROVIDER_TYPE_INFO.find((provider) => provider.id === 'custom');
    expect(custom).toMatchObject({
      name: 'Custom',
      requiresApiKey: true,
      showBaseUrl: true,
      showModelId: true,
      modelIdPlaceholder: 'your-provider/model-id',
    });
    expect(getProviderDocsUrl(custom, 'en')).toBeTruthy();
    expect(shouldShowProviderModelId(custom, false)).toBe(true);
    expect(resolveProviderModelForSave(custom, 'openai/gpt-5.4', false)).toBe('openai/gpt-5.4');
  });

  it('filters the frontend registry to Moyu while keeping full model configuration in moyu mode', async () => {
    const {
      PROVIDER_TYPE_INFO,
      SETUP_PROVIDERS,
      getProviderDocsUrl,
      resolveProviderModelForSave,
      shouldShowProviderModelId,
    } = await loadProviders('moyu');

    expect(PROVIDER_TYPE_INFO).toHaveLength(1);
    expect(SETUP_PROVIDERS).toHaveLength(1);

    const custom = PROVIDER_TYPE_INFO[0];
    expect(custom).toMatchObject({
      id: 'custom',
      name: '魔芋',
      defaultBaseUrl: 'https://www.moyu.info/v1',
      defaultModelId: 'gpt-5.4',
      showBaseUrl: true,
      showModelId: true,
      modelIdPlaceholder: 'your-provider/model-id',
    });
    expect(getProviderDocsUrl(custom, 'zh-CN')).toBe('https://www.moyu.info');
    expect(shouldShowProviderModelId(custom, false)).toBe(true);
    expect(resolveProviderModelForSave(custom, 'gpt-5.4', false)).toBe('gpt-5.4');
  });

  it('includes ark in the backend provider registry', () => {
    expect(BUILTIN_PROVIDER_TYPES).toContain('ark');
    expect(getProviderEnvVar('ark')).toBe('ARK_API_KEY');
    expect(getProviderConfig('ark')).toEqual({
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      api: 'openai-completions',
      apiKeyEnv: 'ARK_API_KEY',
    });
  });

  it('uses a single canonical env key for moonshot provider', () => {
    expect(getProviderEnvVar('moonshot')).toBe('MOONSHOT_API_KEY');
    expect(getProviderEnvVars('moonshot')).toEqual(['MOONSHOT_API_KEY']);
    expect(getProviderConfig('moonshot')).toEqual(
      expect.objectContaining({
        baseUrl: 'https://api.moonshot.cn/v1',
        apiKeyEnv: 'MOONSHOT_API_KEY',
      })
    );
  });
});
