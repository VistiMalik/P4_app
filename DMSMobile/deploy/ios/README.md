# iOS Deployment (App Store)

The iOS native project is located in `../../ios`.

## Prerequisites
- A Mac computer with Xcode installed.
- An Apple Developer Account.

## Building for App Store

1. **Install Pods:**
   ```bash
   cd ../../ios
   pod install
   ```

2. **Open Workspace:**
   Open `../../ios/DMSMobile.xcworkspace` in Xcode.

3. **Configure Signing:**
   - Click on the project in the left navigator.
   - Select the "DMSMobile" target.
   - Go to the "Signing & Capabilities" tab.
   - Select your Team (Apple Developer Account).

4. **Archive:**
   - Select "Any iOS Device (arm64)" as the build target.
   - Go to **Product > Archive**.

5. **Upload:**
   - Once archived, the Organizer window will open.
   - Click "Distribute App" and follow the prompts to upload to TestFlight/App Store Connect.

## Alternative: EAS Build
If you don't have a Mac, use EAS Build to build in the cloud:
```bash
eas build --platform ios
```

