/**
 * Update Settings Component
 * Displays the current version and explains that in-app updates are disabled.
 */
import { useEffect } from 'react';
import { Info } from 'lucide-react';
import { useUpdateStore } from '@/stores/update';
import { useTranslation } from 'react-i18next';

export function UpdateSettings() {
  const { t } = useTranslation('settings');
  const {
    currentVersion,
    isInitialized,
    init,
  } = useUpdateStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Version */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('updates.currentVersion')}</p>
          <p className="text-2xl font-bold">v{currentVersion}</p>
        </div>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="rounded-lg border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">{t('updates.disabledTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('updates.disabledDescription')}</p>
      </div>

      <p className="text-xs text-muted-foreground">{t('updates.help')}</p>
    </div>
  );
}

export default UpdateSettings;
