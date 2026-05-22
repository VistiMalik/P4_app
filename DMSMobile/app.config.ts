import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "DMS Mobile",
  slug: "dms-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.jpg",
  userInterfaceStyle: "light",
  scheme: "dmsmobile",
  splash: {
    image: "./assets/splash.png",
    backgroundColor: "#1B5E20",
    resizeMode: "contain"
  },
  platforms: ["ios", "android"],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://example.com/api"
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  updates: {
    url: "https://u.expo.dev/example"
  },
  runtimeVersion: {
    policy: "sdkVersion"
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.example.dmsmobile",
    infoPlist: {
      NSBluetoothAlwaysUsageDescription:
        "Precisamos do Bluetooth para conectar à balança e registrar seus pesos."
    },
    entitlements: {
      "com.apple.developer.bluetooth-central": true
    }
  },
  android: {
    package: "com.example.dmsmobile",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1B5E20"
    },
    permissions: [
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.ACCESS_FINE_LOCATION"
    ]
  },
  androidStatusBar: {
    backgroundColor: "#1B5E20",
    barStyle: "light-content"
  },
  assetBundlePatterns: ["**/*"],
  plugins: [
    [
      "expo-router",
      {
        origin: "https://expo.dev"
      }
    ],
    "expo-secure-store"
  ]
});
