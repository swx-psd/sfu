export default {
  name: "SecFlix",
  slug: "secflix",
  scheme: "secflix",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000"
  },
  platforms: ["ios", "android", "web"], // Web etkin
  ios: {
    bundleIdentifier: "com.secflix.app",
    buildNumber: "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000"
    },
    package: "com.secflix.app",
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
    output: "single"
  },
  plugins: [],
  extra: {
    tmdb: {
      apiBase: "https://api.themoviedb.org/3",
      imageBase: "https://image.tmdb.org/t/p/",
      apiKey: "6b64c934f5d191e020e5682f69f68d58",
      language: "tr-TR",
      region: "US",
    },
    eas: {
      projectId: "631ca3b9-69c1-4249-b5ca-c43e000c60b2",
    },
  },
  /* updates: removed */
} as const;


