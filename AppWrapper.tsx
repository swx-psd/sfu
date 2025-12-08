/**
 * OTA-Enabled App Wrapper
 * Wraps the main app with UpdateProvider and handles initial update check
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UpdateProvider, useUpdate } from './contexts/UpdateContext';
import { UpdateSplash } from './components/UpdateSplash';
import MainApp from './App';

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
    const [showSplash, setShowSplash] = useState(true);

    // Initial update check on mount
    useEffect(() => {
        const performInitialCheck = async () => {
            try {
                await checkForUpdates();
            } catch (err) {
                console.error('[AppWrapper] Initial check error:', err);
            } finally {
                setInitialCheckDone(true);
                // Hide splash after a minimum display time
                setTimeout(() => setShowSplash(false), 1500);
            }
        };

        performInitialCheck();
    }, []);

    // Auto-download if update available
    useEffect(() => {
        if (
            initialCheckDone &&
            updateInfo?.available &&
            status === 'idle' &&
            showSplash
        ) {
            console.log('[AppWrapper] Update available, starting download...');
            downloadUpdate();
        }
    }, [initialCheckDone, updateInfo, status, showSplash]);

    // Show splash during initial check or update download
    if (showSplash || status === 'checking' || status === 'downloading' || status === 'ready') {
        return (
            <UpdateSplash
                status={status}
                progress={progress}
                error={error}
                currentVersion={updateInfo?.currentVersion}
                latestVersion={updateInfo?.latestVersion}
                onRetry={checkForUpdates}
                onApply={status === 'ready' ? applyUpdate : undefined}
            />
        );
    }

    // Show main app
    return <MainApp />;
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
