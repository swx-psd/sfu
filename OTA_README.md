# OTA Update System

This project uses a custom GitHub Releases-based OTA (Over-The-Air) update system.

## How it works

1. Build bundles with `npm run bundle:all`
2. Push a version tag (e.g., `git tag v1.0.1 && git push origin v1.0.1`)
3. GitHub Actions automatically creates a release with bundles
4. Apps check for updates on startup and download new bundles

## Manual Release Process

If you prefer to create releases manually:

```bash
# 1. Build bundles
npm run bundle:all

# 2. Create a GitHub release
# Go to: https://github.com/swx-psd/sfu/releases/new
# Upload files from ./bundles/:
#   - android.bundle
#   - ios.bundle
#   - manifest.json
```

## Testing OTA Updates

1. **Build and run the app** on a device/emulator
2. **Create a new release** (either via tag or manually)
3. **Close and reopen the app** - it will detect and download the update
4. **Apply the update** when prompted

## Bundle Scripts

- `npm run bundle:android` - Build Android bundle
- `npm run bundle:ios` - Build iOS bundle
- `npm run bundle:all` - Build both + generate manifest
- `npm run create:manifest` - Generate manifest.json

## Important Notes

- ⚠️ Only JavaScript code updates work via OTA
- ⚠️ Native code changes require App Store/Play Store update
- ⚠️ Bundles are public on GitHub - don't include sensitive data
