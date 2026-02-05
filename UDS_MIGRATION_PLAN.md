# UDS Migration Plan: Mail App Conversion

## Executive Summary

Your mail app currently uses **shadcn/ui** (Radix UI + Tailwind) with **Lucide React** icons. The UDS (Universal Design System) provides a complete replacement with Yahoo's design language, including:
- **29 UDS Components** (Box, Text, Button, Badge, etc.)
- **625+ UDS Icons** (similar coverage to Lucide)
- **Theme-based styling** with dark/light mode support
- **Semantic color tokens** (primary, secondary, brand, etc.)

---

## Phase 1: Foundation Setup

### 1.1 Install UDS Dependencies
```bash
npm install @yahoo/uds @yahoo/uds-icons
```

### 1.2 Create Theme Configuration Files

Copy the bundled email theme examples as starting templates:

| Source (Skill Assets) | Destination |
|----------------------|-------------|
| `email.config.ts` (545KB) | `./email.config.ts` |
| `tailwind.config.email.ts` | `./tailwind.config.email.ts` |
| `email.css` | `./app/email.css` |

**Commands to copy files:**
```bash
cp .claude/skills/uds-helper/assets/examples/email.config.ts ./email.config.ts
cp .claude/skills/uds-helper/assets/examples/tailwind.config.email.ts ./tailwind.config.email.ts
cp .claude/skills/uds-helper/assets/examples/email.css ./app/email.css
```

### 1.3 Update Tailwind Configuration

Modify `tailwind.config.email.ts`:
```typescript
import { tailwindPlugin, getUDSContent } from '@yahoo/uds/tailwind/plugin';
import type { Config } from 'tailwindcss';
import { config as themeConfig } from './email.config';

const config: Config = {
  important: '.uds-email',  // Wrapper class
  content: [...getUDSContent(), './app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  corePlugins: { preflight: false },
  plugins: [tailwindPlugin({ config: themeConfig })],
};

export default config;
```

### 1.4 Update CSS Entry Point

Update `app/globals.css` to reference the UDS theme:
```css
@config "../tailwind.config.email.ts";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 2: Component Mapping

### 2.1 Layout Components

| Current (shadcn/Tailwind) | UDS Replacement |
|--------------------------|-----------------|
| `<div className="flex">` | `<Box display="flex">` |
| `<div className="flex-col">` | `<VStack>` |
| `<div className="flex-row">` | `<HStack>` |
| Custom spacing classes | `spacing`, `gap`, `spacingHorizontal` props |

### 2.2 UI Components Conversion Table

| shadcn Component | UDS Component | Notes |
|-----------------|---------------|-------|
| `Button` | `Button` | Use `variant="primary"`, `startIcon={Icon}` |
| `IconButton` (custom) | `IconButton` | Use `name={Icon}` prop |
| `Badge` | `Badge` | Use `variant="brand"` for purple |
| `Avatar + AvatarFallback` | `AvatarText` | Use `initials="XX"` prop |
| `Card` | `Box` with border props | `borderWidth="thin" borderRadius="md"` |
| `Checkbox` | `Checkbox` | Similar API |
| `ScrollArea` | `Box` with `className="overflow-auto"` | Native scrolling |
| `Separator` | `Divider` | Use `variant="muted"` |
| `Tabs` | Custom with `Chip`/`ChipToggle` | Build custom tab UI |
| `Collapsible` | Custom with state | Implement with Box + state |
| `DropdownMenu` | `Menu` | UDS Menu component |

### 2.3 Icon Mapping (Lucide → UDS)

| Lucide Icon | UDS Icon | Import |
|-------------|----------|--------|
| `Inbox` | `Inbox` | `@yahoo/uds-icons` |
| `Send` | `PaperPlane` | Different name |
| `Trash2` | `Trash` | Simplified name |
| `Archive` | `Archive` | Same |
| `Star` | `Star` | Same, use `variant="fill"/"outline"` |
| `FileText` | `Document` | Different name |
| `AlertCircle` | `Error` or `Warning` | Different name |
| `RefreshCw` | `Refresh` | Simplified |
| `ChevronRight/Left/Up/Down` | Same names | Same |
| `Paperclip` | `Paperclip` | Same |
| `Mail` | `Envelope` | Different name |
| `Menu` | `ThreeLines` | Different name |
| `X` | `Cross` | Different name |
| `LogOut` | `LogOut` | Same |
| `Reply` | N/A | Use `PaperPlane` rotated or custom |
| `Forward` | N/A | Use custom arrow |
| `Eye/EyeOff` | `Eye`/`NoEye` | Different naming |
| `Download` | `Download` | Same |
| `MoreVertical` | `MoreVertical` | Same |
| `Loader2` | N/A | Use CSS animation |

---

## Phase 3: Component-by-Component Migration

### 3.1 Root Layout (`app/layout.tsx`)

**Changes:**
- Import `email.css` at the top
- Wrap content with UDS theme wrapper

```typescript
import './email.css';
import { Box, DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';

// In ThemeProvider or layout:
<Box className={`uds-email ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}>
  {children}
</Box>
```

### 3.2 Mail Page (`app/mail/page.tsx`)

**Current Structure:**
- Desktop header with logo, selectors, buttons
- Three-panel layout (sidebar, message list, detail)
- Mobile layout with drawer

**UDS Conversion:**
1. Replace `<div className="...">` with `<Box>` components
2. Use `HStack`/`VStack` for flex layouts
3. Replace all Lucide icons with UDS icons
4. Convert Button components
5. Keep custom `ResizablePanels` (UDS doesn't have this)

**Example Header Conversion:**
```typescript
// Before (shadcn)
<header className="bg-white dark:bg-gray-800 shadow-sm border-b">
  <div className="flex justify-between items-center h-16">
    <Mail className="h-8 w-8 text-purple-600" />
    <h1 className="text-xl font-semibold">Yahoo Mail</h1>
  </div>
</header>

// After (UDS)
<Box
  display="flex"
  flexDirection="row"
  spacingHorizontal="4"
  spacingVertical="2"
  borderBottomWidth="thin"
  borderColor="secondary"
  alignItems="center"
  justifyContent="space-between"
>
  <HStack gap="4" alignItems="center">
    <Icon name={Envelope} size="md" color="brand" />
    <Text variant="title3" color="brand">Yahoo Mail</Text>
  </HStack>
</Box>
```

### 3.3 Folder Sidebar (`components/folder-sidebar.tsx`)

**Key Changes:**
- Replace `Button variant="ghost"` → `Box` with hover styles
- Replace `ScrollArea` → `Box className="overflow-auto"`
- Replace Lucide icons → UDS icons
- Replace `Collapsible` → Custom state management
- Replace unread count badges → `Badge variant="brand"`

**UDS Pattern:**
```typescript
<HStack
  gap="3"
  alignItems="center"
  justifyContent="space-between"
  spacing="2"
  borderRadius="md"
  backgroundColor={isActive ? "brand-secondary" : undefined}
  className="cursor-pointer hover:bg-[var(--color-bg-secondary)]"
>
  <Icon name={Inbox} size="sm" color={isActive ? "brand" : "secondary"} />
  <Text variant="label2" color={isActive ? "brand" : "primary"}>{name}</Text>
  {unreadCount > 0 && <Badge variant="brand" size="sm">{unreadCount}</Badge>}
</HStack>
```

### 3.4 Message List (`components/message-list.tsx`)

**Key Changes:**
- Replace `Avatar + AvatarFallback` → `AvatarText`
- Replace `Checkbox` → UDS `Checkbox`
- Replace `Badge` → UDS `Badge`
- Replace `Skeleton` → Custom loading with Box animations
- Convert all styling to Box props

**UDS Pattern:**
```typescript
<Box
  display="flex"
  flexDirection="column"
  spacing="3"
  borderRadius="md"
  backgroundColor={isSelected ? "brand-secondary" : undefined}
  className="cursor-pointer hover:bg-[var(--color-bg-secondary)]"
  onClick={onSelect}
>
  <HStack gap="3" alignItems="flex-start">
    <AvatarText initials={initials} size="sm" />
    <VStack gap="1" className="flex-1 min-w-0">
      <Text variant={isRead ? "label2" : "headline1"} className="truncate">
        {senderName}
      </Text>
      <Text variant="caption1" color="secondary" className="truncate">
        {preview}
      </Text>
    </VStack>
    <Icon name={Star} variant={isStarred ? "fill" : "outline"} color={isStarred ? "warning" : "tertiary"} />
  </HStack>
</Box>
```

### 3.5 Message Detail (`components/message-detail.tsx`)

**Key Changes:**
- Replace `Card` → `Box` with border props
- Replace `Separator` → `Divider`
- Replace `DropdownMenu` → UDS `Menu`
- Replace action buttons → UDS `Button` with `startIcon`

**UDS Pattern:**
```typescript
// Action buttons
<HStack gap="2">
  <Button variant="primary" size="md" startIcon={PaperPlane}>Reply</Button>
  <Button variant="secondary" size="md">Forward</Button>
</HStack>

// Attachment card
<Box
  borderWidth="thin"
  borderColor="secondary"
  borderRadius="md"
  spacing="3"
>
  <HStack gap="3" alignItems="center">
    <Icon name={Paperclip} size="sm" color="secondary" />
    <VStack gap="0">
      <Text variant="label3" color="primary">{filename}</Text>
      <Text variant="caption2" color="secondary">{size}</Text>
    </VStack>
  </HStack>
</Box>
```

### 3.6 Theme Toggle (`components/theme-toggle.tsx`)

**UDS Conversion:**
```typescript
import { IconButton } from '@yahoo/uds';
import { Sun, CrescentMoon } from '@yahoo/uds-icons';

<IconButton
  name={isDarkMode ? CrescentMoon : Sun}
  variant="tertiary"
  size="sm"
  aria-label="Toggle theme"
  onClick={() => setIsDarkMode(!isDarkMode)}
/>
```

### 3.7 Other Components to Migrate

**Components requiring conversion:**
- `components/mobile-header.tsx` - Icons and layout
- `components/mailbox-selector.tsx` - Dropdown/Menu component
- `components/account-switcher.tsx` - Dropdown/Menu component
- `lib/theme-context.tsx` - Update to use UDS color mode constants

---

## Phase 4: Remove shadcn Dependencies

### 4.1 Delete UI Components
Remove the entire `components/ui/` directory (15 files) after migration:
- `alert.tsx`
- `avatar.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `dropdown-menu.tsx`
- `input.tsx`
- `label.tsx`
- `resizable-panels.tsx` (KEEP - UDS doesn't have this)
- `scroll-area.tsx`
- `separator.tsx`
- `skeleton.tsx`
- `tabs.tsx`

### 4.2 Update Package.json

**Remove:**
```json
"@radix-ui/react-avatar"
"@radix-ui/react-checkbox"
"@radix-ui/react-collapsible"
"@radix-ui/react-dialog"
"@radix-ui/react-dropdown-menu"
"@radix-ui/react-label"
"@radix-ui/react-scroll-area"
"@radix-ui/react-separator"
"@radix-ui/react-slot"
"@radix-ui/react-tabs"
"class-variance-authority"
"lucide-react"
```

**Add:**
```json
"@yahoo/uds": "^latest"
"@yahoo/uds-icons": "^latest"
```

### 4.3 Delete Configuration Files
- `components.json` (shadcn config)

---

## Phase 5: Testing & Verification

### 5.1 Clear Cache
```bash
rm -rf .next && rm -rf node_modules/.cache
npm run dev
```

### 5.2 Visual Testing Checklist
- [ ] Theme toggle works (dark/light mode)
- [ ] Folder sidebar renders correctly with icons
- [ ] Folder selection highlights work
- [ ] Message list renders with avatars
- [ ] Message selection styling works
- [ ] Star/flagged icons toggle correctly
- [ ] Message detail renders full content
- [ ] Attachments display correctly
- [ ] All buttons are clickable
- [ ] Responsive mobile layout works
- [ ] Mobile drawer sidebar functions
- [ ] Resizable panels work on desktop
- [ ] No console errors
- [ ] All interactive elements have proper hover states

---

## Migration Order (Recommended)

1. **Foundation** - Setup theme files, install packages (Phase 1)
2. **Root Layout** - Add theme wrapper to `app/layout.tsx`
3. **Theme Toggle** - Simple component, test theming works
4. **Create Icon Mapping** - Create utility/constants for icon mapping
5. **Folder Sidebar** - Moderate complexity
6. **Message List** - Higher complexity
7. **Message Detail** - Highest complexity
8. **Mail Page** - Integration of all components
9. **Other Components** - Mobile header, selectors, etc.
10. **Cleanup** - Remove shadcn dependencies

---

## Files to Create/Modify Summary

| Action | File | Phase |
|--------|------|-------|
| CREATE | `email.config.ts` | 1 |
| CREATE | `tailwind.config.email.ts` | 1 |
| CREATE | `app/email.css` | 1 |
| MODIFY | `app/globals.css` | 1 |
| MODIFY | `package.json` | 1, 4 |
| MODIFY | `app/layout.tsx` | 3 |
| MODIFY | `components/theme-toggle.tsx` | 3 |
| MODIFY | `components/folder-sidebar.tsx` | 3 |
| MODIFY | `components/message-list.tsx` | 3 |
| MODIFY | `components/message-detail.tsx` | 3 |
| MODIFY | `app/mail/page.tsx` | 3 |
| MODIFY | `components/mobile-header.tsx` | 3 |
| MODIFY | `components/mailbox-selector.tsx` | 3 |
| MODIFY | `components/account-switcher.tsx` | 3 |
| MODIFY | `lib/theme-context.tsx` | 3 |
| DELETE | `components/ui/*.tsx` (14 files, keep resizable-panels) | 4 |
| DELETE | `components.json` | 4 |

---

## Estimated Effort

| Phase | Components | Complexity | Time Estimate |
|-------|-----------|------------|---------------|
| Phase 1: Foundation | 3 files | Low | 30 min |
| Phase 2: Mapping | Reference only | N/A | 15 min |
| Phase 3: Component Migration | 10 components | Medium-High | 4-6 hours |
| Phase 4: Cleanup | 15+ files | Low | 30 min |
| Phase 5: Testing | N/A | Medium | 1-2 hours |
| **Total** | | | **6-9 hours** |

---

## Key UDS Concepts to Remember

### Color Mode Management
```typescript
import { DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';

// Apply to same element as wrapper class
<Box className={`uds-email ${isDark ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}>
```

### Semantic Colors
- `primary` - Main background/foreground
- `secondary` - Secondary background/foreground
- `brand` - Purple/brand color
- `tertiary` - Lighter text
- `warning` - Yellow (for stars)
- `error` - Red

### Text Variants
- `display1` - Large display text
- `headline1` - Heading
- `title3` - Sub-heading
- `body1` - Body text
- `label2` - Labels
- `caption1` - Small text

### Common Patterns
```typescript
// Hover state
className="hover:bg-[var(--color-bg-secondary)]"

// Selected state
backgroundColor={isSelected ? "brand-secondary" : undefined}

// Icon with variant
<Icon name={Star} variant="fill" color="warning" />

// Button with icon
<Button variant="primary" startIcon={Icon}>Text</Button>
```

---

## Troubleshooting

### Build Error "Unexpected token"
```bash
rm -rf .next && rm -rf node_modules/.cache
npm run dev
```

### Theme Not Applying
1. Check wrapper class is `uds-email`
2. Color mode class is on same element
3. CSS file is imported
4. Tailwind config path is correct

### Icons Not Showing
1. Import from `@yahoo/uds-icons` not `lucide-react`
2. Use `name={IconName}` prop not `<IconName />`
3. Check icon name mapping (some differ from Lucide)

---

## Resources

- **UDS Skill Location**: `.claude/skills/uds-helper/`
- **Example Email App**: `.claude/skills/uds-helper/assets/examples/email-page.tsx`
- **Component Reference**: `.claude/skills/uds-helper/references/UDS_COMPONENTS_REFERENCE.md`
- **Color Palette**: `.claude/skills/uds-helper/references/COLOR_PALETTE.md`
- **Troubleshooting Guide**: `.claude/skills/uds-helper/references/TROUBLESHOOTING.md`

---

## Next Steps

When ready to start implementation:
1. Create a new git branch: `git checkout -b feature/uds-migration`
2. Start with Phase 1 (Foundation Setup)
3. Test after each component migration
4. Commit frequently
5. Create PR when complete

Good luck with the migration! 🚀
