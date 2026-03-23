import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const customVendor = {
  id: 'custom',
  name: '魔芋',
  icon: '🧿',
  placeholder: 'sk-...',
  model: 'Multi-Model',
  requiresApiKey: true,
  defaultBaseUrl: 'https://www.moyu.info/v1',
  defaultModelId: 'gpt-5.4',
  showBaseUrl: true,
  showModelId: true,
  modelIdPlaceholder: 'your-provider/model-id',
  category: 'custom',
  envVar: 'CUSTOM_API_KEY',
  supportedAuthModes: ['api_key'],
  defaultAuthMode: 'api_key',
  supportsMultipleAccounts: true,
} as const;

const customAccount = {
  id: 'custom-1',
  vendorId: 'custom',
  label: '魔芋',
  authMode: 'api_key',
  baseUrl: 'https://www.moyu.info/v1',
  apiProtocol: 'openai-completions',
  model: 'gpt-5.4',
  enabled: true,
  isDefault: true,
  createdAt: '2026-03-23T00:00:00.000Z',
  updatedAt: '2026-03-23T00:00:00.000Z',
} as const;

const customStatus = {
  id: 'custom-1',
  name: '魔芋',
  type: 'custom',
  baseUrl: 'https://www.moyu.info/v1',
  apiProtocol: 'openai-completions',
  model: 'gpt-5.4',
  enabled: true,
  createdAt: '2026-03-23T00:00:00.000Z',
  updatedAt: '2026-03-23T00:00:00.000Z',
  hasKey: true,
  keyMasked: 'sk-***',
} as const;

async function renderProvidersSettings() {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_PROVIDER_MODE', 'moyu');

  vi.doMock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'zh-CN' },
    }),
  }));

  vi.doMock('@/stores/settings', () => ({
    useSettingsStore: (selector: (state: { devModeUnlocked: boolean }) => unknown) => selector({
      devModeUnlocked: false,
    }),
  }));

  vi.doMock('@/stores/providers', () => ({
    useProviderStore: () => ({
      statuses: [customStatus],
      accounts: [customAccount],
      vendors: [customVendor],
      defaultAccountId: 'custom-1',
      loading: false,
      refreshProviderSnapshot: vi.fn(),
      createAccount: vi.fn(),
      removeAccount: vi.fn(),
      updateAccount: vi.fn(),
      setDefaultAccount: vi.fn(),
      validateAccountApiKey: vi.fn(async () => ({ valid: true })),
    }),
  }));

  const { ProvidersSettings } = await import('@/components/settings/ProvidersSettings');
  render(<ProvidersSettings />);
}

describe('ProvidersSettings in moyu mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('keeps the add action and full model configuration available for custom accounts', async () => {
    await renderProvidersSettings();

    expect(screen.getByRole('button', { name: 'aiProviders.add' })).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('aiProviders.card.editKey'));

    expect(screen.getByText('aiProviders.sections.model')).toBeInTheDocument();
    expect(screen.getByLabelText('aiProviders.dialog.baseUrl')).toBeInTheDocument();
    expect(screen.getByLabelText('aiProviders.dialog.modelId')).toBeInTheDocument();
  });

  it('prefills new moyu accounts with the shared default base URL and model', async () => {
    await renderProvidersSettings();

    fireEvent.click(screen.getByRole('button', { name: 'aiProviders.add' }));

    expect(screen.getByDisplayValue('https://www.moyu.info/v1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('gpt-5.4')).toBeInTheDocument();
  });
});
