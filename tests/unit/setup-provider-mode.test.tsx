import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createHostApiFetchMock() {
  return vi.fn(async (path: string) => {
    if (path === '/api/provider-accounts') return [];
    if (path === '/api/providers') return [];
    if (path === '/api/provider-vendors') return [];
    if (path === '/api/provider-accounts/default') return { accountId: null };
    if (path.startsWith('/api/providers/') && path.endsWith('/api-key')) return { apiKey: null };
    if (path.startsWith('/api/providers/')) return null;
    return {};
  });
}

async function renderProviderContent(mode?: string, selectedProvider: string | null = null) {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_PROVIDER_MODE', mode ?? '');

  vi.doMock('react-i18next', () => ({
    initReactI18next: { type: '3rdParty', init: vi.fn() },
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  }));

  vi.doMock('@/i18n', () => ({
    SUPPORTED_LANGUAGES: [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en', label: 'English' },
    ],
  }));

  vi.doMock('@/stores/settings', () => ({
    useSettingsStore: (selector?: (state: { devModeUnlocked: boolean }) => unknown) => {
      const state = { devModeUnlocked: false };
      return selector ? selector(state) : state;
    },
  }));

  vi.doMock('@/lib/host-api', () => ({
    hostApiFetch: createHostApiFetchMock(),
  }));

  vi.doMock('@/lib/api-client', async () => {
    const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
    return {
      ...actual,
      invokeIpc: vi.fn(async () => ({ valid: true })),
    };
  });

  const { SETUP_PROVIDERS } = await import('@/lib/providers');
  const { ProviderContent } = await import('@/pages/Setup');

  render(
    <ProviderContent
      providers={SETUP_PROVIDERS}
      selectedProvider={selectedProvider}
      onSelectProvider={vi.fn()}
      apiKey=""
      onApiKeyChange={vi.fn()}
      onConfiguredChange={vi.fn()}
    />
  );
}

describe('Setup provider flow', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('restores the provider selector in default mode', async () => {
    await renderProviderContent();

    expect(await screen.findByText('provider.selectPlaceholder')).toBeInTheDocument();
  });

  it('keeps model configuration visible in moyu mode', async () => {
    await renderProviderContent('moyu', 'custom');

    expect(await screen.findByLabelText('provider.baseUrl')).toBeInTheDocument();
    expect(await screen.findByLabelText('provider.modelId')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('https://www.moyu.info/v1')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('gpt-5.4')).toBeInTheDocument();
  });
});
