# UDS Email Theme - Complete Example

This directory contains a complete, production-ready UDS theme implementation for an email client interface.

## Files Included

### 1. email.config.ts (545KB)
Complete UDS theme configuration with:
- Full colorMode definitions (light & dark)
- All component token configurations (~20,000 lines)
- Production-tested color palettes
- Typography scales
- Spacing values
- Border radii and shadows

**This is a real, working config from a production application.**

### 2. tailwind.config.email.ts (480B)
Tailwind CSS configuration that:
- Imports the email theme config
- Sets up the `.uds-email` wrapper class
- Configures content paths
- Integrates UDS Tailwind plugin

### 3. email.css (104B)
CSS file that:
- References the Tailwind config
- Applies Tailwind directives
- Must be imported in your component

### 4. email-page.tsx (17KB, 559 lines)
Complete email client implementation featuring:
- Three-panel layout (folders, messages, detail)
- Dark/light mode toggle
- Component patterns (folders, email list, message view)
- Icon usage throughout
- Interactive states and hover effects
- Proper TypeScript types

## How to Use

### Quick Start

1. **Copy the theme config:**
   ```bash
   cp email.config.ts ./my-theme.config.ts
   ```

2. **Copy and adapt the Tailwind config:**
   ```bash
   cp tailwind.config.email.ts ./tailwind.config.mytheme.ts
   ```
   Update the import and wrapper class name:
   ```typescript
   import { config as myThemeConfig } from './my-theme.config';

   const config: Config = {
     important: '.uds-mytheme', // Change wrapper class
     // ...
   };
   ```

3. **Copy the CSS file:**
   ```bash
   cp email.css ./src/app/mytheme.css
   ```
   Update the config path in the CSS file:
   ```css
   @config "../../tailwind.config.mytheme.ts";
   ```

4. **Reference the component code:**
   - Open `email-page.tsx` to see implementation patterns
   - Copy layout structures you need
   - Adapt components for your use case

### Customizing the Theme

#### Change Colors

Edit `email.config.ts` and modify the `colorMode` section:

```typescript
"colorMode": {
  "dark": {
    "palette": {
      "background": {
        "primary": { "hue": "carbon", "step": "2" },  // Adjust step
        "secondary": { "hue": "carbon", "step": "3" }
      }
    }
  }
}
```

Available hues: `carbon`, `gray`, `blue`, `red`, `green`, `orange`, `purple`
Steps: `0` (lightest) to `15` (darkest)

#### Change Wrapper Class

1. In `tailwind.config.email.ts`:
   ```typescript
   important: '.uds-my-app',
   ```

2. In your component:
   ```typescript
   <Box className="uds-my-app ...">
   ```

## Component Patterns to Learn From

### Three-Column Layout
See lines 430-555 in email-page.tsx for responsive three-panel layout

### Folder/Navigation Items
See `FolderItem` component (lines 135-168) for:
- Active state styling
- Icon + text + badge pattern
- Hover effects

### List Items with Selection
See `EmailListItem` component (lines 170-231) for:
- Multi-line content truncation
- Selection state
- Avatar + text + metadata layout

### Dark Mode Toggle
See lines 363-367 and 411-418 for theme toggle implementation

### Icon Usage Patterns
Throughout the file, see examples of:
- Icon component usage
- IconButton implementation
- Button with startIcon/endIcon

## File Sizes

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| email.config.ts | 545KB | ~20,000 | Theme tokens |
| tailwind.config.email.ts | 480B | ~15 | Tailwind setup |
| email.css | 104B | 4 | CSS directives |
| email-page.tsx | 17KB | 559 | App component |

## Dependencies Required

```bash
npm install @yahoo/uds @yahoo/uds-icons
```

## Additional Notes

- The config file is large (545KB) because it includes complete token definitions for all UDS components
- You can customize just the `colorMode` section if you want to keep the default component configs
- The email-page.tsx uses 'use client' directive as it has interactive state
- All TypeScript types are included and properly typed

## See Also

- [../references/EXAMPLE_EMAIL_APP.md](../../references/EXAMPLE_EMAIL_APP.md) - Detailed breakdown
- [../references/COLOR_PALETTE.md](../../references/COLOR_PALETTE.md) - Color system reference
- [../references/COMPONENT_EXAMPLES.md](../../references/COMPONENT_EXAMPLES.md) - Component patterns
