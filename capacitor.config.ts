import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymrats.app',
  appName: 'Gym Rats',
  // Vite outputs the production build here; `cap sync` copies it into the APK.
  webDir: 'dist',
};

export default config;
