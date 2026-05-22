# Android Deployment (Play Store)

The Android native project is located in `../../android`.

## Prerequisites
- You need a **Release Keystore** to sign your app for the Play Store.
- Do NOT use the `debug.keystore` for production.

## generating a Release Bundle (.aab)

1. **Generate Keystore:**
   ```bash
   keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
   Move this file to `../../android/app/`.

2. **Configure Signing:**
   Edit `../../android/app/build.gradle` to use your new keystore in the `release` config, or set up environment variables in `../../android/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

3. **Build:**
   Run the following command from the project root:
   ```bash
   cd android && ./gradlew bundleRelease
   ```

4. **Locate Artifact:**
   The generated `.aab` file will be at:
   `android/app/build/outputs/bundle/release/app-release.aab`

5. **Upload:**
   Upload this `.aab` file to the Google Play Console.

