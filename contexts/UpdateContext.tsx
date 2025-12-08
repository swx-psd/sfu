/**
 * Update Context
 * Global state management for OTA updates
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Constants from 'expo-constants';

import { getOTAService } from '../services/OTAUpdateService';
import type { UpdateState, UpdateInfo, DownloadProgress, OTAConfig } from '../types/ota.types';

interface UpdateContextValue extends UpdateState {
    checkForUpdates: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    applyUpdate: () => Promise<void>;
    cancelDownload: () => Promise<void>;
    clearCache: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextValue | undefined>(undefined);

export const useUpdate = () => {
    const context = useContext(UpdateContext);
    if (!context) {
        throw new Error('useUpdate must be used within UpdateProvider');
    }
    return context;
};

interface UpdateProviderProps {
    children: React.ReactNode;
}

export const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
    const [state, setState] = useState<UpdateState>({
        status: 'idle',
        progress: 0,
    });

    // Initialize OTA service
    const otaService = React.useMemo(() => {
        const config: OTAConfig = {
            githubRepo: 'swx-psd/sfu',
            manifestUrl: 'https://github.com/swx-psd/sfu/releases/latest/download/manifest.json',
            bundleCacheDir: `${RNFS.DocumentDirectoryPath}/ota-bundles`,
            checkOnStartup: true,
            autoDownload: false,
            autoApply: false,
        };

        return getOTAService(config);
    }, []);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            try {
                await otaService.initialize();
                console.log('[UpdateContext] OTA service initialized');
            } catch (error) {
                console.error('[UpdateContext] Initialization failed:', error);
                setState({
                    status: 'error',
                    progress: 0,
                    error: 'Failed to initialize update system',
                });
            }
        };

        init();
    }, [otaService]);

    const checkForUpdates = useCallback(async () => {
        try {
            setState({ status: 'checking', progress: 0 });

            const updateInfo = await otaService.checkForUpdates();

            setState({
                status: updateInfo.available ? 'idle' : 'idle',
                progress: 0,
                updateInfo,
            });

            console.log('[UpdateContext] Update check complete:', updateInfo);
        } catch (error) {
            console.error('[UpdateContext] Update check failed:', error);
            setState({
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Update check failed',
            });
        }
    }, [otaService]);

    const downloadUpdate = useCallback(async () => {
        try {
            if (!state.updateInfo?.available) {
                throw new Error('No update available to download');
            }

            setState((prev) => ({ ...prev, status: 'downloading', progress: 0 }));

            const onProgress = (progress: DownloadProgress) => {
                setState((prev) => ({
                    ...prev,
                    status: 'downloading',
                    progress: Math.round(progress.progress),
                }));
            };

            await otaService.downloadBundle(state.updateInfo, onProgress);

            setState((prev) => ({
                ...prev,
                status: 'ready',
                progress: 100,
            }));

            console.log('[UpdateContext] Update downloaded and ready');
        } catch (error) {
            console.error('[UpdateContext] Download failed:', error);
            setState((prev) => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Download failed',
            }));
        }
    }, [otaService, state.updateInfo]);

    const applyUpdate = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, status: 'applying' }));
            await otaService.applyUpdate();
            // App will restart, so we won't reach here
        } catch (error) {
            console.error('[UpdateContext] Apply update failed:', error);
            setState((prev) => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to apply update',
            }));
        }
    }, [otaService]);

    const cancelDownload = useCallback(async () => {
        try {
            await otaService.cancelDownload();
            setState((prev) => ({
                ...prev,
                status: 'idle',
                progress: 0,
            }));
            console.log('[UpdateContext] Download cancelled');
        } catch (error) {
            console.error('[UpdateContext] Cancel failed:', error);
        }
    }, [otaService]);

    const clearCache = useCallback(async () => {
        try {
            await otaService.clearCache();
            setState({
                status: 'idle',
                progress: 0,
                updateInfo: undefined,
            });
            console.log('[UpdateContext] Cache cleared');
        } catch (error) {
            console.error('[UpdateContext] Clear cache failed:', error);
            setState((prev) => ({
                ...prev,
                status: 'error',
                error: 'Failed to clear cache',
            }));
        }
    }, [otaService]);

    const value: UpdateContextValue = {
        ...state,
        checkForUpdates,
        downloadUpdate,
        applyUpdate,
        cancelDownload,
        clearCache,
    };

    return <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>;
};
