# Flow360 Dashboard WebView APK - Build Instructions

This is a WebView wrapper APK that loads the Flow360 web dashboard for mobile users without PC access.

## Prerequisites

1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: The build will happen on Expo's servers (no local setup needed)

## Build Steps

### Option 1: Build via EAS (Recommended)

1. **Install dependencies** (on your local machine or any computer with Node.js):
   ```bash
   cd mobile-dashboard
   npm install
   ```

2. **Login to Expo**:
   ```bash
   npx eas-cli login
   ```

3. **Configure EAS project** (first time only):
   ```bash
   npx eas-cli build:configure
   ```

4. **Build APK**:
   ```bash
   npx eas-cli build -p android --profile preview
   ```

5. **Download APK**: After build completes (~15-20 minutes), download the APK from the link provided.

### Option 2: Quick Build with Expo Token

If you have an `EXPO_TOKEN` secret configured:

```bash
cd mobile-dashboard
npm install
EXPO_TOKEN=your_token npx eas-cli build -p android --profile preview --non-interactive
```

## Configuration

### Change Dashboard URL

Edit `App.tsx` and update the `DASHBOARD_URL` constant:

```typescript
const DASHBOARD_URL = 'https://your-domain.replit.app';
```

### App Branding

- **App Name**: Edit `app.json` → `expo.name`
- **Package ID**: Edit `app.json` → `expo.android.package`
- **Icons**: Replace files in `assets/` folder:
  - `icon.png` (1024x1024)
  - `adaptive-icon.png` (1024x1024)
  - `splash-icon.png` (200x200)

## Features

- Loads Flow360 web dashboard in a WebView
- Android back button support (navigates back in browser history)
- Loading spinner while page loads
- Error handling with retry option
- Cookies/session persistence for login

## Production URL

Before building for production, update `DASHBOARD_URL` in `App.tsx` to your production domain:

```typescript
const DASHBOARD_URL = 'https://flow360.replit.app';
```

## Troubleshooting

**Build fails with "Expo project not found":**
- Run `npx eas-cli build:configure` and follow the prompts

**APK won't install:**
- Enable "Install from unknown sources" in Android settings

**Login doesn't persist:**
- Ensure `sharedCookiesEnabled` and `thirdPartyCookiesEnabled` are true in WebView config
