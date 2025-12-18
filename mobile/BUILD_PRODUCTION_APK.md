# Building Production APK for Flow360 Mobile

This guide explains how to build a production APK that connects to your production server.

## Prerequisites

1. Expo account (create at https://expo.dev)
2. EAS CLI installed: `npm install -g eas-cli`
3. Logged into EAS: `eas login`

## Step 1: Configure EAS Project ID

1. Run this in the `mobile` folder:
   ```bash
   cd mobile
   eas init
   ```

2. This will create/update your `app.json` with a valid `projectId`

## Step 2: Set Production API URL

Create a `.env.production` file in the `mobile` folder:

```bash
EXPO_PUBLIC_API_URL=https://your-production-domain.com
```

Replace `https://your-production-domain.com` with your actual production server URL after deploying.

## Step 3: Build Production APK

```bash
cd mobile
eas build --platform android --profile production
```

This will:
- Build an APK optimized for production
- Use the production API URL
- Create a distributable APK file

## Step 4: Download & Install

After the build completes:
1. Go to https://expo.dev and find your build
2. Download the APK
3. Install on Android devices

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| EXPO_PUBLIC_API_URL | Production server URL | https://flow360.example.com |

## Current Development URL

The app currently points to the development server:
```
https://ceaad22e-7426-4b1f-a645-d2bab46d41d2-00-2750hh3y918g9.janeway.replit.dev
```

For production, replace this with your deployed server URL.

## Notes

- The production APK uses the same codebase but connects to your production backend
- Make sure your production server has CORS configured to accept requests from the mobile app
- Test the production build thoroughly before distributing
