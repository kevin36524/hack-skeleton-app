# UDS Troubleshooting Guide

## Build Errors

### Issue: "Unexpected token" when importing CSS

**Symptoms:** Build fails with syntax error when importing CSS file

**Cause:** Build cache or dev server needs restart

**Solution:**
```bash
rm -rf .next
rm -rf node_modules/.cache
# Restart dev server
npm run dev
```

## Theme Issues

### Issue: Theme toggle doesn't change colors

**Symptoms:** Clicking dark/light mode button doesn't update UI colors

**Cause:** Color mode class applied to wrong element

**Wrong:**
```typescript
// ❌ Color mode on document root
useEffect(() => {
  document.documentElement.classList.add(DARK_COLOR_MODE_CLASSNAME);
}, []);
```

**Correct:**
```typescript
// ✅ Color mode on wrapper element
<Box className={`uds-mytheme ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}>
```

**Critical:** The color mode class MUST be on the same element (or child) as the wrapper class!

### Issue: Colors wrong in dark mode

**Cause:** `colorMode.dark.palette` values incorrect or not defined

**Solution:** Verify dark mode palette in theme config file. Common mistake: copying light mode palette without adjusting step values for dark backgrounds.

### Issue: Multiple themes conflicting

**Cause:** Using same wrapper class for different themes, or importing multiple CSS files

**Solution:**
- Each theme needs unique wrapper class (`.uds-theme-a`, `.uds-theme-b`)
- Only import ONE theme CSS per page component
- Each Tailwind config needs matching `important` selector

## Styling Issues

### Issue: Styles not applying

**Checklist:**
1. ✅ CSS file imported? `import './mytheme.css';`
2. ✅ Wrapper class added? `className="uds-mytheme"`
3. ✅ Color mode class added? `className="uds-mytheme uds-dark-mode"`
4. ✅ CSS `@config` path correct? `@config "../../tailwind.config.mytheme.ts"`
5. ✅ Tailwind config `important` matches wrapper? `important: '.uds-mytheme'`
6. ✅ Dev server restarted after config changes?

### Issue: Components not displaying correctly

**Causes:**
- Missing UDS package installation
- Incorrect import paths
- Props not matching component API

**Solution:**
```bash
# Verify packages installed
npm list @yahoo/uds @yahoo/uds-icons

# Reinstall if needed
npm install @yahoo/uds @yahoo/uds-icons
```

## Config File Issues

### Issue: Getting a complete config file

**Problem:** Need full config file to start theme

**Options:**
1. Copy from existing project file (e.g., `eric.config.ts`, `email.config.ts`)
2. Export default config from UDS utilities
3. Start with minimal config and add components as needed

**Note:** Complete config typically contains:
- Component token definitions (~20,000 lines)
- Color mode palettes
- Typography scales
- Spacing values
- Border radii
- Shadow definitions

### Issue: Config changes not taking effect

**Cause:** Dev server not restarted or cache not cleared

**Solution:**
```bash
rm -rf .next
rm -rf node_modules/.cache
# Kill and restart dev server completely
npm run dev
```

## Performance Issues

### Issue: Slow build times

**Cause:** Multiple theme CSS files imported unnecessarily

**Solution:**
- Only import CSS for the theme being used on that page
- Don't import multiple theme CSS files unless absolutely necessary
- The `important` selector helps prevent cross-theme CSS conflicts

### Issue: Large bundle size

**Cause:** Unused components or icons included

**Solution:**
- Tree-shaking should handle this automatically
- Verify imports are named imports, not `import * from '@yahoo/uds'`
- Check bundle analyzer for issues

## File Path Issues

### Issue: CSS can't find Tailwind config

**Symptoms:** Build error about missing config file

**Cause:** Incorrect relative path in `@config` directive

**Solution:**

Check CSS file location and adjust path:

| CSS Location | Correct Config Path |
|-------------|---------------------|
| `src/app/theme.css` | `@config "../../tailwind.config.theme.ts"` |
| `src/app/folder/theme.css` | `@config "../../../tailwind.config.theme.ts"` |
| `src/theme.css` | `@config "../tailwind.config.theme.ts"` |

Count the directory levels from CSS to project root, then use that many `../`.

## Installation Issues

### Issue: UDS packages not found

**Cause:** Packages not installed

**Solution:**
```bash
npm install @yahoo/uds @yahoo/uds-icons
# or
pnpm add @yahoo/uds @yahoo/uds-icons
# or
yarn add @yahoo/uds @yahoo/uds-icons
```

### Issue: TypeScript errors with UDS components

**Cause:** Missing or outdated type definitions

**Solution:**
```bash
# Update to latest versions
npm update @yahoo/uds @yahoo/uds-icons

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## Quick Diagnostic Commands

```bash
# Check for theme configs
ls -la *.config.ts
ls -la tailwind.config.*.ts
ls -la src/app/*.css

# Verify UDS installation
npm list @yahoo/uds @yahoo/uds-icons

# Clear all caches
rm -rf .next node_modules/.cache

# Check for duplicate classes (theme conflicts)
grep -r "uds-" src/app --include="*.tsx" --include="*.jsx"
```
