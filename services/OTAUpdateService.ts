/**
 * OTA Update Service
 * Manages Over-The-Air updates via GitHub Releases
 */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CryptoJS from 'crypto-js';

import type {
    UpdateManifest,
    UpdateInfo,
    DownloadProgress,
    OTAConfig,
} from '../types/ota.types';

const STORAGE_KEYS = {
    CURRENT_VERSION: '@ota/current_version',
    CACHED_BUNDLE_PATH: '@ota/cached_bundle_path',
    PENDING_UPDATE: '@ota/pending_update',
    LAST_CHECK: '@ota/last_check',
};

export class OTAUpdateService {
    private config: OTAConfig;
    private downloadJobId?: number;

    constructor(config: OTAConfig) {
        this.config = config;
    }

    /**
     * Initialize the OTA system
     * Called on app startup
     */
    async initialize(): Promise<void> {
        try {
            // Create bundle cache directory if not exists
            const dirExists = await RNFS.exists(this.config.bundleCacheDir);
            if (!dirExists) {
                await RNFS.mkdir(this.config.bundleCacheDir);
            }

            // Check if there's a pending update to apply
            const pendingUpdate = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPDATE);
            if (pendingUpdate) {
                console.log('[OTA] Pending update found, applying...');
                await this.applyPendingUpdate(pendingUpdate);
            }

            // Check for updates on startup if configured
            if (this.config.checkOnStartup) {
                await this.checkForUpdates();
            }
        } catch (error) {
            console.error('[OTA] Initialization error:', error);
        }
    }

    /**
     * Check if a new update is available
     */
    async checkForUpdates(): Promise<UpdateInfo> {
        try {
            console.log('[OTA] Checking for updates...');

            // Fetch manifest from GitHub
            const manifest = await this.fetchManifest();
            const currentVersion = await this.getCurrentVersion();

            console.log(`[OTA] Current version: ${currentVersion}, Latest: ${manifest.version}`);

            // Compare versions
            const available = this.isNewerVersion(manifest.version, currentVersion);

            const platform = Platform.OS as 'android' | 'ios';
            const downloadSize = manifest.bundles[platform]?.size || 0;

            const updateInfo: UpdateInfo = {
                available,
                currentVersion,
                latestVersion: manifest.version,
                manifest,
                downloadSize,
            };

            // Store last check time
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK, new Date().toISOString());

            return updateInfo;
        } catch (error) {
            console.error('[OTA] Update check failed:', error);
            const currentVersion = await this.getCurrentVersion();
            return {
                available: false,
                currentVersion,
            };
        }
    }

    /**
     * Download bundle with progress tracking
     */
    async downloadBundle(
        updateInfo: UpdateInfo,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<string> {
        if (!updateInfo.manifest) {
            throw new Error('No manifest available');
        }

        const platform = Platform.OS as 'android' | 'ios';
        const bundleInfo = updateInfo.manifest.bundles[platform];

        if (!bundleInfo) {
            throw new Error(`No bundle available for platform: ${platform}`);
        }

        const bundlePath = `${this.config.bundleCacheDir}/${updateInfo.manifest.version}.bundle`;

        console.log(`[OTA] Downloading bundle from: ${bundleInfo.url}`);

        // Download with progress
        const downloadResult = RNFS.downloadFile({
            fromUrl: bundleInfo.url,
            toFile: bundlePath,
            progress: (res) => {
                if (onProgress) {
                    const progress: DownloadProgress = {
                        bytesWritten: res.bytesWritten,
                        contentLength: res.contentLength,
                        progress: (res.bytesWritten / res.contentLength) * 100,
                    };
                    onProgress(progress);
                }
            },
        });

        this.downloadJobId = downloadResult.jobId;

        const result = await downloadResult.promise;

        if (result.statusCode !== 200) {
            throw new Error(`Download failed with status: ${result.statusCode}`);
        }

        // Verify checksum
        console.log('[OTA] Verifying bundle integrity...');
        const isValid = await this.verifyChecksum(bundlePath, bundleInfo.checksum);

        if (!isValid) {
            await RNFS.unlink(bundlePath);
            throw new Error('Bundle checksum verification failed');
        }

        console.log('[OTA] Bundle downloaded successfully');

        // Store pending update info
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPDATE, bundlePath);
        await AsyncStorage.setItem(
            STORAGE_KEYS.CURRENT_VERSION,
            updateInfo.manifest.version
        );

        return bundlePath;
    }

    /**
     * Apply the downloaded update (restart app)
     */
    async applyUpdate(): Promise<void> {
        const pendingUpdate = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPDATE);

        if (!pendingUpdate) {
            throw new Error('No pending update to apply');
        }

        console.log('[OTA] Applying update and restarting app...');

        // Store the bundle path for next launch
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_BUNDLE_PATH, pendingUpdate);

        // Clear pending update
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPDATE);

        // Restart the app
        RNRestart.restart();
    }

    /**
     * Cancel ongoing download
     */
    async cancelDownload(): Promise<void> {
        if (this.downloadJobId !== undefined) {
            RNFS.stopDownload(this.downloadJobId);
            this.downloadJobId = undefined;
            console.log('[OTA] Download cancelled');
        }
    }

    /**
     * Get current bundle version
     */
    async getCurrentVersion(): Promise<string> {
        const version = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_VERSION);
        return version || '0.0.0';
    }

    /**
     * Get cached bundle path
     */
    async getCachedBundlePath(): Promise<string | null> {
        return await AsyncStorage.getItem(STORAGE_KEYS.CACHED_BUNDLE_PATH);
    }

    /**
     * Clear all cached bundles
     */
    async clearCache(): Promise<void> {
        try {
            const dirExists = await RNFS.exists(this.config.bundleCacheDir);
            if (dirExists) {
                await RNFS.unlink(this.config.bundleCacheDir);
                await RNFS.mkdir(this.config.bundleCacheDir);
            }

            await AsyncStorage.multiRemove([
                STORAGE_KEYS.CACHED_BUNDLE_PATH,
                STORAGE_KEYS.PENDING_UPDATE,
            ]);

            console.log('[OTA] Cache cleared');
        } catch (error) {
            console.error('[OTA] Failed to clear cache:', error);
            throw error;
        }
    }

    /**
     * Private: Fetch manifest from GitHub
     */
    private async fetchManifest(): Promise<UpdateManifest> {
        try {
            const response = await axios.get<UpdateManifest>(this.config.manifestUrl, {
                timeout: 10000,
                headers: { 'Cache-Control': 'no-cache' },
            });

            return response.data;
        } catch (error) {
            console.error('[OTA] Failed to fetch manifest:', error);
            throw new Error('Unable to fetch update manifest');
        }
    }

    /**
     * Private: Apply pending update on app restart
     */
    private async applyPendingUpdate(bundlePath: string): Promise<void> {
        try {
            const exists = await RNFS.exists(bundlePath);

            if (exists) {
                await AsyncStorage.setItem(STORAGE_KEYS.CACHED_BUNDLE_PATH, bundlePath);
                await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPDATE);
                console.log('[OTA] Pending update applied');
            } else {
                console.warn('[OTA] Pending update bundle not found');
                await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPDATE);
            }
        } catch (error) {
            console.error('[OTA] Failed to apply pending update:', error);
        }
    }

    /**
     * Private: Verify bundle checksum
     */
    private async verifyChecksum(
        filePath: string,
        expectedChecksum: string
    ): Promise<boolean> {
        try {
            // Read file and calculate SHA-256 hash
            const fileContent = await RNFS.readFile(filePath, 'base64');
            const wordArray = CryptoJS.enc.Base64.parse(fileContent);
            const hash = CryptoJS.SHA256(wordArray).toString();

            return hash === expectedChecksum;
        } catch (error) {
            console.error('[OTA] Checksum verification error:', error);
            return false;
        }
    }

    /**
     * Private: Compare versions (semantic versioning)
     */
    private isNewerVersion(latest: string, current: string): boolean {
        const parseVersion = (v: string) => v.split('.').map(Number);

        const latestParts = parseVersion(latest);
        const currentParts = parseVersion(current);

        for (let i = 0; i < 3; i++) {
            if (latestParts[i] > currentParts[i]) return true;
            if (latestParts[i] < currentParts[i]) return false;
        }

        return false;
    }
}

// Singleton instance
let otaServiceInstance: OTAUpdateService | null = null;

export const getOTAService = (config?: OTAConfig): OTAUpdateService => {
    if (!otaServiceInstance) {
        if (!config) {
            throw new Error('OTAUpdateService must be initialized with config');
        }
        otaServiceInstance = new OTAUpdateService(config);
    }
    return otaServiceInstance;
};
