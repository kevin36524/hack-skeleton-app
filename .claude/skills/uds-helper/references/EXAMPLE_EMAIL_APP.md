# Complete Email App Example

This is a reference implementation showing a full-featured email client using the UDS email theme. All example files are bundled in the skill's `assets/examples/` directory.

## Bundled Files

The skill includes these complete working examples:

- **[email.config.ts](../assets/examples/email.config.ts)** - Full theme config (545KB, ~20,000 lines)
- **[tailwind.config.email.ts](../assets/examples/tailwind.config.email.ts)** - Tailwind config
- **[email.css](../assets/examples/email.css)** - Theme CSS file
- **[email-page.tsx](../assets/examples/email-page.tsx)** - Complete email app component (559 lines)

## File Structure

```
skill/assets/examples/
├── email.config.ts              # Theme config (545KB, production-ready)
├── tailwind.config.email.ts     # Tailwind config for email theme
├── email.css                    # Email theme CSS
└── email-page.tsx               # Complete email app component
```

## Key Implementation Details

### 1. Theme Setup

```typescript
// CSS import at top of file
import "./email.css";

// Wrapper class with color mode on root Box
<Box
  className={`uds-email h-screen w-full ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}
  backgroundColor="primary"
>
```

**Note:** Both `.uds-email` wrapper class AND color mode class are on the same element.

### 2. Layout Structure

The email app uses a 3-panel layout:

```typescript
<Box> {/* Root with theme class */}
  <Box> {/* Top header bar */}
    {/* Logo, search, settings, avatar */}
  </Box>

  <HStack> {/* Main content area */}
    <Box> {/* Folder panel (left) */}
      {/* Compose button, folder list */}
    </Box>

    <Box> {/* Messages list (center) */}
      {/* List header, filters, email items */}
    </Box>

    <Box> {/* Message detail (right) */}
      {/* Message content, reply actions */}
    </Box>
  </HStack>
</Box>
```

### 3. Component Patterns Used

**Folder Item (with hover state):**
```typescript
<HStack
  gap="3"
  alignItems="center"
  borderRadius="md"
  backgroundColor={folder.isActive ? "brand-secondary" : undefined}
  className="cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
>
  <Icon name={folder.icon} size="sm" color={folder.isActive ? "brand" : "secondary"} />
  <Text color={folder.isActive ? "brand" : "primary"}>{folder.name}</Text>
  {folder.count && <Badge variant={folder.isActive ? "brand" : "secondary"}>{folder.count}</Badge>}
</HStack>
```

**Email List Item:**
```typescript
<Box
  onClick={onSelect}
  backgroundColor={isSelected ? "brand-secondary" : undefined}
  className={`cursor-pointer transition-colors ${!isSelected ? "hover:bg-[var(--color-bg-secondary)]" : ""}`}
>
  <HStack gap="3" alignItems="flex-start">
    <AvatarText initials={email.senderInitials} size="sm" />
    <VStack gap="1" className="flex-1 min-w-0">
      <HStack justifyContent="space-between" className="w-full">
        <Text variant={email.isRead ? "label2" : "headline1"} className="truncate">
          {email.sender}
        </Text>
        <HStack gap="1" className="shrink-0">
          {email.hasAttachment && <Icon name={Paperclip} size="xs" />}
          <Text variant="caption2" color="secondary">{email.time}</Text>
        </HStack>
      </HStack>
      <Text variant={email.isRead ? "label3" : "label2"} className="truncate w-full">
        {email.subject}
      </Text>
      <Text variant="caption1" color="secondary" className="truncate w-full">
        {email.preview}
      </Text>
    </VStack>
    <Icon
      name={Star}
      variant={email.isStarred ? "fill" : "outline"}
      color={email.isStarred ? "warning" : "tertiary"}
    />
  </HStack>
</Box>
```

**Theme Toggle:**
```typescript
const [isDarkMode, setIsDarkMode] = useState(false);

<IconButton
  name={isDarkMode ? CrescentMoon : Sun}
  variant="tertiary"
  size="sm"
  aria-label="Toggle theme"
  onClick={() => setIsDarkMode(!isDarkMode)}
/>
```

### 4. Styling Techniques

**Mixing UDS props with Tailwind classes:**
```typescript
<Box
  display="flex"
  flexDirection="column"
  spacing="3"           // UDS spacing prop
  backgroundColor="primary"  // UDS color
  className="w-56 overflow-auto"  // Tailwind utilities
/>
```

**Using CSS variables for hover states:**
```typescript
className="hover:bg-[var(--color-bg-secondary)]"
```

**Conditional styling:**
```typescript
backgroundColor={isActive ? "brand-secondary" : undefined}
color={isRead ? "secondary" : "primary"}
variant={isStarred ? "fill" : "outline"}
```

### 5. Icons Usage

```typescript
import {
  Inbox, PaperPlane, DraftDocument, Trash, Folder, Star,
  Archive, MagnifyingGlass, Cog, Refresh, Printer,
  MoreVertical, Paperclip, Check, Envelope, RetailTag,
  Add, Priority, Sun, CrescentMoon,
} from '@yahoo/uds-icons';

// Used in Icon component
<Icon name={Inbox} size="sm" color="secondary" />

// Used in IconButton
<IconButton name={Cog} variant="tertiary" size="sm" aria-label="Settings" />

// Used in Button
<Button variant="primary" startIcon={PaperPlane}>Reply</Button>
```

### 6. Layout Props

**Common display props:**
```typescript
display="flex"
flexDirection="column" | "row"
alignItems="center" | "flex-start" | "stretch"
justifyContent="space-between" | "flex-start" | "flex-end"
```

**Spacing props:**
```typescript
spacing="3"           // All sides padding
spacingHorizontal="4" // Left/right padding
spacingVertical="2"   // Top/bottom padding
gap="2"              // Gap between children
rowGap="4"           // Row gap in flex
columnGap="3"        // Column gap in flex
```

**Border props:**
```typescript
borderWidth="thin"
borderColor="secondary"
borderRadius="md"
borderBottomWidth="thin"
borderEndWidth="thin"  // End edge (right in LTR)
```

### 7. TypeScript Patterns

```typescript
interface EmailFolder {
  id: string;
  name: string;
  icon: typeof Inbox;  // Icon type
  count?: number;
  isActive?: boolean;
}

interface EmailMessage {
  id: string;
  sender: string;
  senderInitials: string;
  subject: string;
  preview: string;
  time: string;
  isStarred: boolean;
  isRead: boolean;
  hasAttachment?: boolean;
}
```

### 8. State Management

```typescript
const [selectedEmailId, setSelectedEmailId] = useState(emails[0].id);
const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];
const [isDarkMode, setIsDarkMode] = useState(false);

// Selection handler
onSelect={() => setSelectedEmailId(email.id)}

// Theme toggle
onClick={() => setIsDarkMode(!isDarkMode)}
```

## Common Patterns to Reuse

### Three-column layout:
```typescript
<HStack gap="0" alignItems="stretch" className="flex-1 overflow-hidden">
  <Box className="w-56 overflow-auto">{/* Left panel */}</Box>
  <Box className="w-80 overflow-hidden">{/* Center panel */}</Box>
  <Box className="flex-1 overflow-hidden">{/* Right panel */}</Box>
</HStack>
```

### Section with border:
```typescript
<Box
  spacing="3"
  borderBottomWidth="thin"
  borderColor="secondary"
>
  {/* Content */}
</Box>
```

### Scrollable list:
```typescript
<VStack gap="0" alignItems="stretch" className="flex-1 overflow-auto">
  {items.map(item => (
    <React.Fragment key={item.id}>
      <ItemComponent item={item} />
      <Divider variant="muted" />
    </React.Fragment>
  ))}
</VStack>
```

### Search box:
```typescript
<Box
  display="flex"
  columnGap="2"
  spacing="2"
  backgroundColor="secondary"
  borderRadius="md"
  alignItems="center"
  className="flex-1"
>
  <Icon name={MagnifyingGlass} size="sm" color="secondary" />
  <Text variant="label2" color="tertiary">Search mail</Text>
</Box>
```

## Using These Examples

To use these bundled examples in your project:

1. **Copy the config file:**
   ```bash
   cp .claude/skills/uds-helper/assets/examples/email.config.ts ./my-theme.config.ts
   ```

2. **Copy the Tailwind config:**
   ```bash
   cp .claude/skills/uds-helper/assets/examples/tailwind.config.email.ts ./tailwind.config.mytheme.ts
   ```

3. **Copy the CSS file:**
   ```bash
   cp .claude/skills/uds-helper/assets/examples/email.css ./src/app/mytheme.css
   ```

4. **Reference the component:**
   - Open `email-page.tsx` to see complete implementation patterns
   - Copy specific patterns you need

## Files Reference

All example files are located in the skill at:
- `assets/examples/email.config.ts` (545KB, production-ready theme)
- `assets/examples/tailwind.config.email.ts` (Tailwind configuration)
- `assets/examples/email.css` (Theme CSS)
- `assets/examples/email-page.tsx` (Complete email app, 559 lines)

These are complete, working files that can be used as templates for building UDS applications.
