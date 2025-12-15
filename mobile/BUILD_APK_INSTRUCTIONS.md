# Building Flow360 Mobile APK

## Prerequisites
1. An Expo account (free at https://expo.dev/signup)
2. Node.js installed on your local machine

## Option 1: EAS Cloud Build (Recommended)

### Step 1: Install EAS CLI locally
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Link project to your Expo account
```bash
cd mobile
eas init
```
This will create a project on Expo and update the `projectId` in app.json.

### Step 4: Build the APK
```bash
# For preview/testing APK:
eas build --platform android --profile preview

# For production APK:
eas build --platform android --profile production
```

### Step 5: Download APK
After the build completes (usually 10-15 minutes), you'll receive a download link for the APK file.

## Option 2: Build from Replit with Token

If you have an Expo access token, you can set it as an environment variable:

1. Go to https://expo.dev/settings/access-tokens and create a token
2. Add `EXPO_TOKEN` to your Replit secrets
3. Run:
```bash
cd mobile && EXPO_TOKEN=your_token eas build --platform android --profile preview --non-interactive
```

## Build Profiles

The project is configured with these build profiles in `eas.json`:

- **development**: Debug APK with development client
- **preview**: Release APK for internal testing
- **production**: Release APK for distribution

## APK vs AAB

The current configuration builds APK files (for direct installation). If you need AAB for Google Play Store:

Edit `eas.json` and change `"buildType": "apk"` to `"buildType": "aab"` in the production profile.

## Troubleshooting

- **Missing projectId**: Run `eas init` to link your project
- **Build fails**: Check that all dependencies are installed with `npm install`
- **Android package conflict**: Ensure `com.flow360.sales` is unique

## App Information

- **Package Name**: com.flow360.sales
- **App Name**: Flow360 Sales
- **Version**: 1.0.0
