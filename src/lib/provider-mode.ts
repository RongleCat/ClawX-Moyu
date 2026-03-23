import type { ProviderTypeInfo } from '@/lib/providers';

export type ProviderMode = 'default' | 'moyu';

const MOYU_PROVIDER_ID = 'custom';

function normalizeProviderMode(value: string | undefined): ProviderMode {
  return value?.trim().toLowerCase() === 'moyu' ? 'moyu' : 'default';
}

export function getProviderMode(): ProviderMode {
  return normalizeProviderMode(import.meta.env.VITE_PROVIDER_MODE);
}

export function isMoyuMode(): boolean {
  return getProviderMode() === 'moyu';
}

export function applyProviderMode(
  providers: ProviderTypeInfo[],
): ProviderTypeInfo[] {
  if (!isMoyuMode()) {
    return providers;
  }

  return providers
    .filter((provider) => provider.id === MOYU_PROVIDER_ID)
    .map((provider) => ({
      ...provider,
      name: '魔芋',
      placeholder: 'sk-...',
      model: 'Multi-Model',
      defaultBaseUrl: 'https://www.moyu.info/v1',
      defaultModelId: 'gpt-5.4',
      showBaseUrl: true,
      showModelId: true,
      docsUrl: 'https://www.moyu.info',
      docsUrlZh: 'https://www.moyu.info',
    }));
}
