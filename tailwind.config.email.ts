import { tailwindPlugin, getUDSContent } from '@yahoo/uds/tailwind/plugin';
import type { Config } from 'tailwindcss';

import { config as emailConfig } from './email.config';

const config: Config = {
  important: '.uds-email',
  content: [
    ...getUDSContent(),
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  plugins: [
    tailwindPlugin({
      config: emailConfig as any, // Cast to any due to version mismatch
    }),
  ],
};

export default config;
