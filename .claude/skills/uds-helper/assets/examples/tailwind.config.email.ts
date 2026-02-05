import { tailwindPlugin, getUDSContent } from '@yahoo/uds/tailwind/plugin';
import type { Config } from 'tailwindcss';

import { config as emailConfig } from './email.config.ts';

const config: Config = {
  important: '.uds-email',
  content: [...getUDSContent(), './src/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: { preflight: false }, // Disable css reset, base already adds it
  plugins: [
    tailwindPlugin({
      config: emailConfig,
    }),
  ],
};

export default config;
