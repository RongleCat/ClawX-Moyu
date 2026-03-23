/**
 * Auto-Updater Module
 * Automatic in-app updates are intentionally disabled. Release artifacts are
 * built in CI and distributed through external channels instead.
 */
import { BrowserWindow, app, ipcMain } from 'electron';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export type UpdateInfo = {
  version: string;
  releaseDate?: string;
  releaseNotes?: string | null;
};

export type ProgressInfo = {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
};

export type UpdateDownloadedEvent = UpdateInfo;

export const AUTO_UPDATE_DISABLED_MESSAGE =
  'Automatic updates are disabled. New installers are distributed manually.';

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error' | 'disabled';
  info?: UpdateInfo;
  progress?: ProgressInfo;
  error?: string;
}

export interface UpdaterEvents {
  'status-changed': (status: UpdateStatus) => void;
  'checking-for-update': () => void;
  'update-available': (info: UpdateInfo) => void;
  'update-not-available': (info: UpdateInfo) => void;
  'download-progress': (progress: ProgressInfo) => void;
  'update-downloaded': (event: UpdateDownloadedEvent) => void;
  'error': (error: Error) => void;
}

export class AppUpdater extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private status: UpdateStatus = {
    status: 'disabled',
    error: AUTO_UPDATE_DISABLED_MESSAGE,
  };

  constructor() {
    super();

    // EventEmitter treats an unhandled 'error' event as fatal. Keep a default
    // listener so updater failures surface in logs/UI without terminating main.
    this.on('error', (error: Error) => {
      logger.error('[Updater] AppUpdater emitted error:', error);
    });
    logger.info('[Updater] Automatic updates are disabled for this build.');
  }

  /**
   * Set the main window for sending update events
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Get current update status
   */
  getStatus(): UpdateStatus {
    return this.status;
  }

  /**
   * Update status and notify renderer
   */
  private updateStatus(newStatus: Partial<UpdateStatus>): void {
    this.status = {
      status: newStatus.status ?? this.status.status,
      info: newStatus.info,
      progress: newStatus.progress,
      error: newStatus.error,
    };
    this.sendToRenderer('update:status-changed', this.status);
  }

  /**
   * Send event to renderer process
   */
  private sendToRenderer(channel: string, data: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    this.updateStatus({
      status: 'disabled',
      error: AUTO_UPDATE_DISABLED_MESSAGE,
    });
    return null;
  }

  async downloadUpdate(): Promise<void> {
    throw new Error(AUTO_UPDATE_DISABLED_MESSAGE);
  }

  quitAndInstall(): void {
    logger.info('[Updater] Install requested but automatic updates are disabled');
  }

  cancelAutoInstall(): void {
    this.sendToRenderer('update:auto-install-countdown', { seconds: -1, cancelled: true });
  }

  setChannel(channel: 'stable' | 'beta' | 'dev'): void {
    logger.info(`[Updater] Ignoring update channel change to "${channel}" because automatic updates are disabled`);
  }

  setAutoDownload(enable: boolean): void {
    logger.info(`[Updater] Ignoring auto-download=${String(enable)} because automatic updates are disabled`);
  }

  getCurrentVersion(): string {
    return app.getVersion();
  }
}

/**
 * Register IPC handlers for update operations
 */
export function registerUpdateHandlers(
  updater: AppUpdater,
  mainWindow: BrowserWindow
): void {
  updater.setMainWindow(mainWindow);

  // Get current update status
  ipcMain.handle('update:status', () => {
    return updater.getStatus();
  });

  // Get current version
  ipcMain.handle('update:version', () => {
    return updater.getCurrentVersion();
  });

  // Check for updates – always return final status so the renderer
  // never gets stuck in 'checking' waiting for a push event.
  ipcMain.handle('update:check', async () => {
    await updater.checkForUpdates();
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE, status: updater.getStatus() };
  });

  ipcMain.handle('update:download', async () => {
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE };
  });

  ipcMain.handle('update:install', () => {
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE };
  });

  ipcMain.handle('update:setChannel', (_, channel: 'stable' | 'beta' | 'dev') => {
    updater.setChannel(channel);
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE };
  });

  ipcMain.handle('update:setAutoDownload', (_, enable: boolean) => {
    updater.setAutoDownload(enable);
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE };
  });

  ipcMain.handle('update:cancelAutoInstall', () => {
    updater.cancelAutoInstall();
    return { success: false, error: AUTO_UPDATE_DISABLED_MESSAGE };
  });

}

// Export singleton instance
export const appUpdater = new AppUpdater();
