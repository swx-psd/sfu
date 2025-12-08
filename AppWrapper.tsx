/**
 * OTA-Enabled App Wrapper
 * Wraps the main app with OTA update functionality
 */

import React, { useEffect, useState } from 'react';
import { UpdateProvider, useUpdate } from './contexts/UpdateContext';
import { UpdateSplash } from './components/UpdateSplash';
import App from './App';

/**
 * App content that uses update context
 */
const AppContent: React.FC = () => {
    const {
        status,
        progress,
        error,
        updateInfo,
        checkForUpdates,
        downloadUpdate,
        applyUpdate,
    } = useUpdate();

    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Initial update check on mount
    useEffect(() => {
        const performInitialCheck = async () => {
            try {
                await checkForUpdates();
            } catch (err) {
                console.error('[AppWrapper] Initial check error:', err);
            } finally {
                setInitialCheckDone(true);
            }
        };

        performInitialCheck();
    }, []);

    // Auto-download if update available
    useEffect(() => {
        if (
            initialCheckDone &&
            updateInfo?.available &&
            status === 'idle'
        ) {
            console.log('[AppWrapper] Update available, starting download...');
            downloadUpdate();
        }
    }, [initialCheckDone, updateInfo, status]);

    // Show splash when update is ready
    if (status === 'ready') {
        return (
            <UpdateSplash
                status="ready"
                progress={100}
                error={error}
                currentVersion={updateInfo?.currentVersion}
                latestVersion={updateInfo?.latestVersion}
                onRetry={checkForUpdates}
                onApply={applyUpdate}
            />
        );
    }

    // Show splash during check or download
    if (!initialCheckDone || status === 'checking' || status === 'downloading' || status === 'applying') {
        return (
            <UpdateSplash
                status={status}
                progress={progress}
                error={error}
                currentVersion={updateInfo?.currentVersion}
                latestVersion={updateInfo?.latestVersion}
                onRetry={checkForUpdates}
                onApply={undefined}
            />
        );
    }

    // Show main app
    return <App />;
};

/**
 * Root component with UpdateProvider
 */
export default function AppWrapper() {
    return (
        <UpdateProvider>
            <AppContent />
        </UpdateProvider>
    );
}
