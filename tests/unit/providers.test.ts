import { describe, expect, it } from 'vitest';
import {
  PROVIDER_TYPES,
  PROVIDER_TYPE_INFO,
  getProviderDocsUrl,
  resolveProviderApiKeyForSave,
  resolveProviderModelForSave,
  shouldShowProviderModelId,
} from '@/lib/providers';
import {
  BUILTIN_PROVIDER_TYPES,
  getProviderConfig,
  getProviderEnvVar,
  getProviderEnvVars,
} from '@electron/utils/provider-registry';

describe('provider metadata', () => {
  it('keeps the compatibility provider type list while exposing only Moyu in the frontend registry', () => {
    expect(PROVIDER_TYPES).toContain('ark');
    expect(PROVIDER_TYPES).toContain('custom');

    expect(PROVIDER_TYPE_INFO).toEqual([
      expect.objectContaining({
        id: 'custom',
        name: '魔芋',
        requiresApiKey: true,
        defaultBaseUrl: 'https://www.moyu.info',
        showBaseUrl: false,
        showModelId: false,
      }),
    ]);
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

  it('keeps builtin backend providers available for compatibility', () => {
    expect(BUILTIN_PROVIDER_TYPES).toEqual(
      expect.arrayContaining(['anthropic', 'openai', 'google', 'openrouter', 'ark', 'moonshot', 'siliconflow', 'minimax-portal', 'minimax-portal-cn', 'qwen-portal', 'ollama'])
    );
  });

  it('uses Moyu default provider metadata in the frontend registry', () => {
    expect(PROVIDER_TYPE_INFO[0]).toMatchObject({
      id: 'custom',
      defaultBaseUrl: 'https://www.moyu.info',
      requiresApiKey: true,
      showBaseUrl: false,
      showModelId: false,
    });
  });

  it('exposes Moyu documentation links', () => {
    const custom = PROVIDER_TYPE_INFO.find((provider) => provider.id === 'custom');

    expect(custom).toMatchObject({
      docsUrl: 'https://www.moyu.info',
    });
    expect(getProviderDocsUrl(custom, 'en')).toBe('https://www.moyu.info');
    expect(getProviderDocsUrl(custom, 'zh-CN')).toBe('https://www.moyu.info');
  });

  it('does not expose model overrides in the fixed Moyu frontend flow', () => {
    const custom = PROVIDER_TYPE_INFO.find((provider) => provider.id === 'custom');

    expect(custom).toMatchObject({
      showModelId: false,
    });
    expect(shouldShowProviderModelId(custom, false)).toBe(false);
    expect(shouldShowProviderModelId(custom, true)).toBe(false);
  });

  it('does not save model overrides for the fixed Moyu frontend flow', () => {
    const custom = PROVIDER_TYPE_INFO.find((provider) => provider.id === 'custom');

    expect(resolveProviderModelForSave(custom, 'openai/gpt-5', false)).toBeUndefined();
    expect(resolveProviderModelForSave(custom, 'openai/gpt-5', true)).toBeUndefined();
    expect(resolveProviderModelForSave(custom, '   ', false)).toBeUndefined();
  });

  it('normalizes provider API keys for save flow', () => {
    expect(resolveProviderApiKeyForSave('ollama', '')).toBe('ollama-local');
    expect(resolveProviderApiKeyForSave('ollama', '   ')).toBe('ollama-local');
    expect(resolveProviderApiKeyForSave('ollama', 'real-key')).toBe('real-key');
    expect(resolveProviderApiKeyForSave('openai', '')).toBeUndefined();
    expect(resolveProviderApiKeyForSave('openai', ' sk-test ')).toBe('sk-test');
  });
});
