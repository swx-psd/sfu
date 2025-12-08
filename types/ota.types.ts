/**
 * OTA Update System Types
 * GitHub Releases based Over-The-Air update system
 */

export interface BundleInfo {
    url: string;
    size: number;
    checksum: string;
}

export interface UpdateManifest {
    version: string;
    buildTime: string;
    bundles: {
        android: BundleInfo;
        ios: BundleInfo;
    };
    minimumAppVersion: string;
    releaseNotes?: string;
}

export interface UpdateInfo {
    available: boolean;
    currentVersion: string;
    latestVersion?: string;
    manifest?: UpdateManifest;
    downloadSize?: number;
}

export interface DownloadProgress {
    bytesWritten: number;
    contentLength: number;
    progress: number; // 0-100
}

export type UpdateStatus =
    | 'idle'
    | 'checking'
    | 'downloading'
    | 'ready'
    | 'applying'
    | 'error';

export interface UpdateState {
    status: UpdateStatus;
    progress: number;
    error?: string;
    updateInfo?: UpdateInfo;
}

export interface OTAConfig {
    githubRepo: string;
    manifestUrl: string;
    bundleCacheDir: string;
    checkOnStartup: boolean;
    autoDownload: boolean;
    autoApply: boolean;
}
