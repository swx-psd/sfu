#!/usr/bin/env node

/**
 * Create Manifest Script for Expo OTA Updates
 * Handles Hermes bytecode (.hbc) files from expo export
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BUNDLES_DIR = path.join(__dirname, '..', 'bundles');
const OUTPUT_FILE = path.join(BUNDLES_DIR, 'manifest.json');

// Read package.json for version
const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

const GITHUB_REPO = 'swx-psd/sfu';
const VERSION = packageJson.version;

/**
 * Calculate SHA-256 checksum
 */
function calculateChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

/**
 * Get file size
 */
function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
}

/**
 * Find bundle file (supports both .js and .hbc Hermes bytecode)
 */
function findBundleFile(platform) {
    const platformJsDir = path.join(BUNDLES_DIR, '_expo', 'static', 'js', platform);

    if (!fs.existsSync(platformJsDir)) {
        console.warn(`⚠️  Platform directory not found: ${platformJsDir}`);
        return null;
    }

    const files = fs.readdirSync(platformJsDir);

    // Look for index-*.hbc (Hermes bytecode) or index-*.js files
    let bundleFile = files.find(f => f.startsWith('index-') && (f.endsWith('.hbc') || f.endsWith('.js')));

    if (!bundleFile) {
        // Fallback: find any .hbc or largest .js file
        bundleFile = files.find(f => f.endsWith('.hbc'));

        if (!bundleFile) {
            let largestFile = null;
            let largestSize = 0;

            files.forEach(file => {
                if (file.endsWith('.js')) {
                    const filePath = path.join(platformJsDir, file);
                    const size = getFileSize(filePath);
                    if (size > largestSize) {
                        largestSize = size;
                        largestFile = file;
                    }
                }
            });

            bundleFile = largestFile;
        }
    }

    if (!bundleFile) {
        console.warn(`⚠️  No bundle file found for ${platform}`);
        return null;
    }

    return path.join(platformJsDir, bundleFile);
}

/**
 * Create bundle info
 */
function createBundleInfo(platform) {
    const bundlePath = findBundleFile(platform);

    if (!bundlePath || !fs.existsSync(bundlePath)) {
        console.warn(`⚠️  Bundle not found for: ${platform}`);
        return null;
    }

    const bundleFileName = `${platform}.bundle`;
    const targetPath = path.join(BUNDLES_DIR, bundleFileName);

    // Copy bundle
    fs.copyFileSync(bundlePath, targetPath);

    const url = `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/${bundleFileName}`;
    const size = getFileSize(targetPath);
    const checksum = calculateChecksum(targetPath);

    console.log(`✓ ${platform}: ${(size / 1024 / 1024).toFixed(2)} MB (${checksum.substring(0, 8)}...)`);

    return { url, size, checksum };
}

/**
 * Main
 */
function main() {
    console.log('\n📦 Creating OTA manifest for Expo...\n');

    if (!fs.existsSync(BUNDLES_DIR)) {
        console.error('❌ Bundles directory not found.');
        console.error('Run: npm run bundle:export');
        process.exit(1);
    }

    const manifest = {
        version: VERSION,
        buildTime: new Date().toISOString(),
        bundles: {},
        minimumAppVersion: '1.0.0',
        releaseNotes: `Release v${VERSION}`,
    };

    // Create bundles
    const androidInfo = createBundleInfo('android');
    const iosInfo = createBundleInfo('ios');

    if (androidInfo) manifest.bundles.android = androidInfo;
    if (iosInfo) manifest.bundles.ios = iosInfo;

    if (Object.keys(manifest.bundles).length === 0) {
        console.error('❌ No bundles found.');
        console.error('Make sure expo export completed successfully.');
        process.exit(1);
    }

    // Write manifest
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Manifest created successfully!`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log(`📌 Version: ${VERSION}`);
    console.log(`\n📦 Files ready for GitHub Release:`);
    console.log(`   ✓ android.bundle (${(manifest.bundles.android?.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   ✓ ios.bundle (${(manifest.bundles.ios?.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   ✓ manifest.json\n`);
}

main();
