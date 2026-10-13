import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enh.restaurant.aide',
  appName: "ENH Restaurant Aide",
  webDir: 'dist',
  android: {
    backgroundColor: '#ffffff',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
