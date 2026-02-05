---
name: uds-helper
description: Yahoo UDS (Universal Design System) setup and configuration for Next.js projects. Use when setting up new UDS themes, configuring theme files and Tailwind configs, creating custom color palettes, implementing dark/light mode, troubleshooting UDS issues, working with UDS components/icons, or managing multiple themes in one application.
---

# Yahoo UDS Helper

## UDS Theme Architecture

Every UDS theme requires **3 core files**:
1. **Theme Config** (`theme-name.config.ts`) - Token definitions and color palettes
2. **Tailwind Config** (`tailwind.config.theme-name.ts`) - Tailwind plugin configuration
3. **CSS File** (`src/app/theme-name.css`) - CSS that references Tailwind config

## Critical Rules

✅ **ALWAYS:**
- Apply color mode class to SAME element as wrapper class
- Import theme CSS at top of component
- Use unique wrapper class per theme (`.uds-theme-name`)
- Clear `.next` cache after config changes

❌ **NEVER:**
- Apply color mode to `document.documentElement`
- Import multiple theme CSS in same component
- Use same wrapper class for different themes

## Quick Setup Workflow

### 1. Create Theme Config (`theme-name.config.ts`)

Copy from existing config file (e.g., `email.config.ts`). The complete config is typically 20,000+ lines. Only customize the `colorMode` section:

```typescript
import type { UniversalTokensConfig } from '@yahoo/uds';

export const config: UniversalTokensConfig = {
  "colorMode": {
    "dark": {
      "palette": {
        "background": {
          "primary": { "hue": "carbon", "step": "2" },
          "secondary": { "hue": "carbon", "step": "3" }
        },
        "foreground": {
          "primary": { "hue": "carbon", "step": "13" },
          "secondary": { "hue": "carbon", "step": "10" }
        }
      }
    },
    "light": {
      "palette": {
        "background": {
          "primary": { "hue": "gray", "step": "0" },
          "secondary": { "hue": "carbon", "step": "2" }
        },
        "foreground": {
          "primary": { "hue": "carbon", "step": "13" },
          "secondary": { "hue": "carbon", "step": "10" }
        }
      }
    }
  }
};
```

### 2. Create Tailwind Config (`tailwind.config.theme-name.ts`)

```typescript
import { tailwindPlugin, getUDSContent } from '@yahoo/uds/tailwind/plugin';
import type { Config } from 'tailwindcss';
import { config as themeConfig } from './theme-name.config';

const config: Config = {
  important: '.uds-theme-name', // Must match wrapper class
  content: [...getUDSContent(), './src/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: { preflight: false },
  plugins: [tailwindPlugin({ config: themeConfig })],
};

export default config;
```

### 3. Create CSS File (`src/app/theme-name.css`)

```css
@config "../../tailwind.config.theme-name.ts";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Path depends on CSS location:
- `src/app/` → `../../`
- `src/app/subfolder/` → `../../../`

### 4. Use in Component

```typescript
'use client';
import '../theme-name.css';
import { Box, DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Box className={`uds-theme-name ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}>
      {/* Content */}
    </Box>
  );
}
```

### 5. Clear Cache and Restart

```bash
rm -rf .next && rm -rf node_modules/.cache
npm run dev
```

## Quick Fixes

**Build error "Unexpected token"** → Clear cache and restart dev server

**Theme toggle not working** → Color mode class must be on same element as wrapper class

**Styles not applying** → Check: CSS imported? Wrapper class added? Config path correct? Dev server restarted?

## Detailed Resources

For detailed information, see:
- **[COLOR_PALETTE.md](references/COLOR_PALETTE.md)** - Available hues, steps, semantic colors
- **[COMPONENT_EXAMPLES.md](references/COMPONENT_EXAMPLES.md)** - Component imports and usage patterns
- **[TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)** - Complete troubleshooting guide
- **[EXAMPLE_EMAIL_APP.md](references/EXAMPLE_EMAIL_APP.md)** - Full working example (email theme)
- **[UDS_COMPONENTS_REFERENCE.md](references/UDS_COMPONENTS_REFERENCE.md)** - Auto-generated complete component & icon reference

## Scripts

Use these scripts to extract information from your installed UDS packages:

```bash
# List all available components (29 components)
node scripts/list-components.js

# List all icons (625+ icons)
node scripts/list-icons.js

# Search for specific icons
node scripts/list-icons.js --search arrow

# Get component API info
node scripts/get-component-info.js Button

# Generate complete reference
node scripts/generate-reference.js
```

See [scripts/README.md](scripts/README.md) for full documentation.

## Bundled Examples

This skill includes complete working examples in `assets/examples/`:
- **email.config.ts** (545KB, production-ready theme with 20,000+ lines)
- **tailwind.config.email.ts** (Tailwind configuration)
- **email.css** (Theme CSS file)
- **email-page.tsx** (Complete email app implementation, 559 lines)

Copy these files to your project as starting templates. See [EXAMPLE_EMAIL_APP.md](references/EXAMPLE_EMAIL_APP.md) for usage instructions.
