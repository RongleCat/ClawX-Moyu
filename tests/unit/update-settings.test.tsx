import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdateSettings } from '@/components/settings/UpdateSettings';

vi.mock('@/stores/update', () => ({
  useUpdateStore: () => ({
    status: 'disabled',
    currentVersion: '1.2.3',
    updateInfo: null,
    progress: null,
    error: 'Automatic updates are disabled.',
    isInitialized: true,
    autoInstallCountdown: null,
    init: vi.fn(),
    checkForUpdates: vi.fn(),
    downloadUpdate: vi.fn(),
    installUpdate: vi.fn(),
    cancelAutoInstall: vi.fn(),
    setChannel: vi.fn(),
    setAutoDownload: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UpdateSettings', () => {
  it('shows the current version and disabled update message without update actions', () => {
    render(<UpdateSettings />);

    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    expect(screen.getByText('updates.disabledTitle')).toBeInTheDocument();
    expect(screen.getByText('updates.disabledDescription')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'updates.action.check' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'updates.action.download' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'updates.action.install' })).not.toBeInTheDocument();
  });
});
