# UDS API Reference

*Comprehensive reference for Yahoo Universal Design System components and utilities*

## Table of Contents

- [Common Props](#common-props)
- [Styling Props](#styling-props)
- [Layout Components](#layout-components)
- [Text Components](#text-components)
- [Interactive Components](#interactive-components)
- [Form Components](#form-components)
- [Icons](#icons)
- [Color Mode](#color-mode)
- [Type Definitions](#type-definitions)

---

## Common Props

### Base Component Props

All UDS components extend standard React props and include:

```typescript
interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  testID?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}
```

### Styling Props

Available on `Box`, `VStack`, `HStack`, and most layout components:

```typescript
interface StyleProps {
  // Background
  backgroundColor?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'positive' | 'negative' | 'warning' | 'info';

  // Border
  borderColor?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'positive' | 'negative' | 'warning' | 'info';
  borderWidth?: 'none' | 'thin' | 'medium' | 'thick';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';

  // Spacing (1-12, using 4px base)
  padding?: number | string;
  paddingX?: number | string;
  paddingY?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;

  margin?: number | string;
  marginX?: number | string;
  marginY?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;

  // Layout
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;

  // Display
  display?: 'block' | 'flex' | 'inline' | 'inline-block' | 'none';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
}
```

---

## Layout Components

### Box

The fundamental building block for all layouts.

```typescript
import { Box } from '@yahoo/uds';

interface BoxProps extends BaseProps, StyleProps {
  as?: keyof JSX.IntrinsicElements; // Default: 'div'
}
```

**Usage:**

```typescript
<Box
  backgroundColor="primary"
  borderColor="secondary"
  borderWidth="thin"
  borderRadius="medium"
  padding="4"
  margin="2"
>
  Content
</Box>
```

**Common Patterns:**

```typescript
// Card
<Box
  backgroundColor="primary"
  borderRadius="large"
  padding="6"
  className="shadow-lg"
>
  <Text>Card content</Text>
</Box>

// Container
<Box
  maxWidth="1200px"
  marginX="auto"
  paddingX="4"
>
  <Text>Centered content</Text>
</Box>
```

### VStack

Vertical stack container with automatic spacing.

```typescript
import { VStack } from '@yahoo/uds';

interface VStackProps extends BoxProps {
  spacing?: number | string;  // Gap between children
  gap?: number | string;      // Alias for spacing
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}
```

**Usage:**

```typescript
<VStack spacing="4" alignItems="flex-start">
  <Text variant="headline1">Title</Text>
  <Text variant="body1">Description</Text>
  <Button variant="primary">Action</Button>
</VStack>
```

### HStack

Horizontal stack container with automatic spacing.

```typescript
import { HStack } from '@yahoo/uds';

interface HStackProps extends BoxProps {
  spacing?: number | string;
  gap?: number | string;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
}
```

**Usage:**

```typescript
<HStack spacing="2" alignItems="center" justifyContent="space-between">
  <Text variant="title2">Settings</Text>
  <IconButton name={Settings} variant="tertiary" size="sm" />
</HStack>
```

### Divider

Visual separator between content sections.

```typescript
import { Divider } from '@yahoo/uds';

interface DividerProps extends BaseProps {
  orientation?: 'horizontal' | 'vertical'; // Default: 'horizontal'
  color?: 'primary' | 'secondary' | 'tertiary';
}
```

**Usage:**

```typescript
<VStack spacing="4">
  <Text>Section 1</Text>
  <Divider color="secondary" />
  <Text>Section 2</Text>
</VStack>

// Vertical divider
<HStack spacing="4" height="40px">
  <Text>Left</Text>
  <Divider orientation="vertical" color="secondary" />
  <Text>Right</Text>
</HStack>
```

---

## Text Components

### Text

Primary text component with semantic variants.

```typescript
import { Text } from '@yahoo/uds';

interface TextProps extends BaseProps {
  variant?:
    | 'display1' | 'display2' | 'display3'      // Large headings
    | 'headline1' | 'headline2' | 'headline3'    // Section headings
    | 'title1' | 'title2' | 'title3'            // Subsection titles
    | 'body1' | 'body2' | 'body3'               // Body text
    | 'label1' | 'label2' | 'label3'            // Labels/captions
    | 'caption1' | 'caption2';                   // Small text

  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'positive' | 'negative' | 'warning' | 'info';

  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  truncate?: boolean;  // Single-line truncation with ellipsis
  as?: keyof JSX.IntrinsicElements; // Default: 'span'
}
```

**Typography Scale:**

```typescript
// Display - Largest (48px, 40px, 32px)
<Text variant="display1" color="primary">Display 1</Text>
<Text variant="display2" color="primary">Display 2</Text>
<Text variant="display3" color="primary">Display 3</Text>

// Headline - Large (28px, 24px, 20px)
<Text variant="headline1" color="primary">Headline 1</Text>
<Text variant="headline2" color="primary">Headline 2</Text>
<Text variant="headline3" color="primary">Headline 3</Text>

// Title - Medium (18px, 16px, 14px)
<Text variant="title1" color="primary">Title 1</Text>
<Text variant="title2" color="primary">Title 2</Text>
<Text variant="title3" color="primary">Title 3</Text>

// Body - Regular (16px, 14px, 12px)
<Text variant="body1" color="secondary">Body 1 - Default paragraph text</Text>
<Text variant="body2" color="secondary">Body 2 - Smaller paragraphs</Text>
<Text variant="body3" color="secondary">Body 3 - Dense text</Text>

// Label - Small (14px, 12px, 11px)
<Text variant="label1" color="tertiary">Label 1</Text>
<Text variant="label2" color="tertiary">Label 2</Text>
<Text variant="label3" color="tertiary">Label 3</Text>

// Caption - Smallest (12px, 11px)
<Text variant="caption1" color="tertiary">Caption 1</Text>
<Text variant="caption2" color="tertiary">Caption 2</Text>
```

**Common Patterns:**

```typescript
// Truncated text
<Text variant="body1" truncate style={{ maxWidth: '200px' }}>
  This is a very long text that will be truncated with ellipsis
</Text>

// Semantic heading
<Text variant="headline1" color="primary" as="h1">
  Page Title
</Text>

// Colored text
<Text variant="body1" color="positive">Success message</Text>
<Text variant="body1" color="negative">Error message</Text>
<Text variant="body1" color="warning">Warning message</Text>
```

### Link

Styled hyperlink component.

```typescript
import { Link } from '@yahoo/uds';

interface LinkProps extends BaseProps {
  href: string;
  variant?: 'primary' | 'secondary';
  color?: 'primary' | 'accent';
  external?: boolean;  // Opens in new tab
  underline?: 'none' | 'hover' | 'always';
}
```

**Usage:**

```typescript
<Link href="/dashboard" variant="primary">Go to Dashboard</Link>
<Link href="https://example.com" external>External Link</Link>
<Link href="/about" underline="hover" color="accent">Learn More</Link>
```

---

## Interactive Components

### Button

Primary action button component.

```typescript
import { Button } from '@yahoo/uds';

interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;

  // Icons
  startIcon?: React.ComponentType;  // Icon on left
  endIcon?: React.ComponentType;    // Icon on right

  // Events
  onPress?: () => void;
  onClick?: () => void;  // Alias for onPress

  // HTML button props
  type?: 'button' | 'submit' | 'reset';
}
```

**Variants:**

```typescript
// Primary - Main action
<Button variant="primary" size="md" onPress={handleSubmit}>
  Submit
</Button>

// Secondary - Supporting action
<Button variant="secondary" size="md" onPress={handleCancel}>
  Cancel
</Button>

// Tertiary - Less prominent action
<Button variant="tertiary" size="sm" onPress={handleEdit}>
  Edit
</Button>

// Ghost - Minimal appearance
<Button variant="ghost" size="md" onPress={handleView}>
  View Details
</Button>

// Destructive - Dangerous action
<Button variant="destructive" size="md" onPress={handleDelete}>
  Delete
</Button>
```

**With Icons:**

```typescript
import { Check, ArrowRight, Plus } from '@yahoo/uds-icons';

<Button variant="primary" startIcon={Check} onPress={handleSave}>
  Save Changes
</Button>

<Button variant="secondary" endIcon={ArrowRight} onPress={handleNext}>
  Next Step
</Button>

<Button variant="primary" startIcon={Plus} size="sm" onPress={handleAdd}>
  Add Item
</Button>
```

**States:**

```typescript
// Disabled
<Button variant="primary" disabled>
  Disabled Button
</Button>

// Loading
<Button variant="primary" loading onPress={handleSubmit}>
  Submitting...
</Button>

// Full width
<Button variant="primary" fullWidth onPress={handleConfirm}>
  Confirm
</Button>
```

### IconButton

Button with only an icon.

```typescript
import { IconButton } from '@yahoo/uds';

interface IconButtonProps extends BaseProps {
  name: React.ComponentType;  // Icon component
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;

  // Required for accessibility
  'aria-label': string;

  onClick?: () => void;
  onPress?: () => void;
}
```

**Usage:**

```typescript
import { Settings, Trash, Edit, Close } from '@yahoo/uds-icons';

<IconButton
  name={Settings}
  variant="tertiary"
  size="md"
  aria-label="Settings"
  onClick={handleSettings}
/>

<IconButton
  name={Trash}
  variant="destructive"
  size="sm"
  aria-label="Delete"
  onClick={handleDelete}
/>

<IconButton
  name={Close}
  variant="ghost"
  size="lg"
  aria-label="Close dialog"
  onClick={handleClose}
/>
```

### Badge

Small label for status, counts, or categories.

```typescript
import { Badge } from '@yahoo/uds';

interface BadgeProps extends BaseProps {
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;  // Show dot indicator
}
```

**Usage:**

```typescript
// Status badges
<Badge variant="positive">Active</Badge>
<Badge variant="negative">Error</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Beta</Badge>
<Badge variant="neutral">Draft</Badge>

// Count badge
<Badge variant="default" size="sm">12</Badge>

// Dot indicator
<Badge variant="positive" dot>Online</Badge>
```

### Chip

Interactive tag/filter component.

```typescript
import { Chip, ChipButton, ChipToggle, ChipDismissible, ChipLink } from '@yahoo/uds';

interface ChipProps extends BaseProps {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;

  // For interactive chips
  onClick?: () => void;
  onDismiss?: () => void;
}
```

**Usage:**

```typescript
// Basic chip
<Chip variant="filled">Category</Chip>

// Interactive button chip
<ChipButton variant="outlined" onClick={handleClick}>
  Click me
</ChipButton>

// Toggle chip (for filters)
<ChipToggle selected={isSelected} onClick={handleToggle}>
  Filter: Active
</ChipToggle>

// Dismissible chip
<ChipDismissible onDismiss={handleRemove}>
  Tag: React
</ChipDismissible>

// Link chip
<ChipLink href="/category/news">
  News
</ChipLink>
```

### Menu

Dropdown menu component.

```typescript
import { Menu } from '@yahoo/uds';

interface MenuProps extends BaseProps {
  trigger: React.ReactNode;  // Element that opens menu
  items: MenuItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onItemSelect?: (itemId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  disabled?: boolean;
  divider?: boolean;  // Show divider after this item
  variant?: 'default' | 'destructive';
}
```

**Usage:**

```typescript
import { Menu } from '@yahoo/uds';
import { Settings, Edit, Trash } from '@yahoo/uds-icons';

const menuItems = [
  { id: 'edit', label: 'Edit', icon: Edit },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'delete', label: 'Delete', icon: Trash, variant: 'destructive', divider: true },
];

<Menu
  trigger={<Button variant="tertiary">Actions</Button>}
  items={menuItems}
  placement="bottom-end"
  onItemSelect={(id) => {
    if (id === 'delete') handleDelete();
    else if (id === 'edit') handleEdit();
  }}
/>
```

---

## Form Components

### Input

Text input field.

```typescript
import { Input, FormLabel, InputHelpText } from '@yahoo/uds';

interface InputProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  // Validation
  error?: boolean;
  success?: boolean;

  // Events
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // Styling
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;

  // Icons
  startIcon?: React.ComponentType;
  endIcon?: React.ComponentType;
}
```

**Usage:**

```typescript
// Basic input
<VStack spacing="2">
  <FormLabel htmlFor="email">Email</FormLabel>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <InputHelpText>We'll never share your email</InputHelpText>
</VStack>

// With validation
<VStack spacing="2">
  <FormLabel htmlFor="username">Username</FormLabel>
  <Input
    id="username"
    value={username}
    error={!!usernameError}
    onChange={handleUsernameChange}
  />
  {usernameError && (
    <InputHelpText color="negative">{usernameError}</InputHelpText>
  )}
</VStack>

// With icons
import { Search } from '@yahoo/uds-icons';

<Input
  type="search"
  placeholder="Search..."
  startIcon={Search}
  fullWidth
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### Checkbox

Checkbox input for multiple selections.

```typescript
import { Checkbox } from '@yahoo/uds';

interface CheckboxProps extends BaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;  // Partially checked state

  onChange?: (checked: boolean) => void;

  label?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**

```typescript
// Basic checkbox
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Accept terms and conditions"
/>

// Indeterminate state (partial selection)
<VStack spacing="2">
  <Checkbox
    checked={allChecked}
    indeterminate={someChecked && !allChecked}
    onChange={handleSelectAll}
    label="Select all"
  />
  <Box paddingLeft="6">
    <VStack spacing="2">
      <Checkbox checked={item1} onChange={setItem1} label="Item 1" />
      <Checkbox checked={item2} onChange={setItem2} label="Item 2" />
      <Checkbox checked={item3} onChange={setItem3} label="Item 3" />
    </VStack>
  </Box>
</VStack>

// Disabled
<Checkbox checked disabled label="Cannot change" />
```

### Radio

Radio button for single selection from multiple options.

```typescript
import { Radio, RadioGroupProvider } from '@yahoo/uds';

interface RadioProps extends BaseProps {
  value: string;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  children: React.ReactNode;
}
```

**Usage:**

```typescript
<RadioGroupProvider name="plan" value={selectedPlan} onChange={setSelectedPlan}>
  <VStack spacing="3">
    <Radio value="free" label="Free Plan - $0/month" />
    <Radio value="pro" label="Pro Plan - $10/month" />
    <Radio value="enterprise" label="Enterprise Plan - $50/month" />
  </VStack>
</RadioGroupProvider>

// With descriptions
<RadioGroupProvider name="theme" value={theme} onChange={setTheme}>
  <VStack spacing="4">
    <Box>
      <Radio value="light" label="Light Mode" />
      <Text variant="caption1" color="tertiary" paddingLeft="8">
        Bright and easy on the eyes during daytime
      </Text>
    </Box>
    <Box>
      <Radio value="dark" label="Dark Mode" />
      <Text variant="caption1" color="tertiary" paddingLeft="8">
        Reduces eye strain in low-light environments
      </Text>
    </Box>
  </VStack>
</RadioGroupProvider>
```

### Switch

Toggle switch for binary on/off states.

```typescript
import { Switch } from '@yahoo/uds';

interface SwitchProps extends BaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;

  onChange?: (checked: boolean) => void;

  label?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**

```typescript
// Basic switch
<Switch
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
  label="Enable notifications"
/>

// Settings list
<VStack spacing="4">
  <HStack justifyContent="space-between" alignItems="center">
    <VStack spacing="1" alignItems="flex-start">
      <Text variant="body1" color="primary">Email notifications</Text>
      <Text variant="caption1" color="tertiary">
        Receive emails about your account activity
      </Text>
    </VStack>
    <Switch checked={emailNotifs} onChange={setEmailNotifs} />
  </HStack>

  <Divider />

  <HStack justifyContent="space-between" alignItems="center">
    <VStack spacing="1" alignItems="flex-start">
      <Text variant="body1" color="primary">Push notifications</Text>
      <Text variant="caption1" color="tertiary">
        Get push notifications on your devices
      </Text>
    </VStack>
    <Switch checked={pushNotifs} onChange={setPushNotifs} />
  </HStack>
</VStack>
```

---

## Icons

### Icon Component

Wrapper for displaying icons.

```typescript
import { Icon } from '@yahoo/uds';

interface IconProps extends BaseProps {
  name: React.ComponentType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'positive' | 'negative' | 'warning' | 'info' | 'inverse';
}
```

**Usage:**

```typescript
import { Icon } from '@yahoo/uds';
import { Star, Heart, Check } from '@yahoo/uds-icons';

// Standard sizes
<Icon name={Star} size="md" color="accent" />
<Icon name={Heart} size="lg" color="positive" />
<Icon name={Check} size="sm" color="primary" />

// Custom size (in pixels)
<Icon name={Star} size={32} color="warning" />

// In buttons and text
<HStack spacing="2" alignItems="center">
  <Icon name={Star} size="sm" color="accent" />
  <Text variant="body1">Featured</Text>
</HStack>
```

### Available Icons

Over 625 icons organized by category. Import from `@yahoo/uds-icons`:

```typescript
// Communication
import { Envelope, OpenEnvelope, EmailVerification } from '@yahoo/uds-icons';

// Navigation
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from '@yahoo/uds-icons';

// Actions
import { Star, Heart, Bookmark, NoStar } from '@yahoo/uds-icons';

// Editing
import { Add, Minus, AddCircle, MinusCircle } from '@yahoo/uds-icons';

// Status
import { Check, Close, Info, Warning, Error } from '@yahoo/uds-icons';

// Files
import { Document, Folder, AddDocument, ImageFile } from '@yahoo/uds-icons';

// Media
import { Play, Pause, Stop, Volume, Mute } from '@yahoo/uds-icons';

// Social
import { Share, Like, Comment, Message } from '@yahoo/uds-icons';

// Settings
import { Settings, Profile, Notification, Privacy } from '@yahoo/uds-icons';

// Weather
import { Sun, CrescentMoon, Cloud, Rain } from '@yahoo/uds-icons';
```

**Searching for Icons:**

Use the script to search available icons:

```bash
# List all icons
node .claude/skills/uds-helper/scripts/list-icons.js

# Search for specific icons
node .claude/skills/uds-helper/scripts/list-icons.js --search arrow
node .claude/skills/uds-helper/scripts/list-icons.js --search email
node .claude/skills/uds-helper/scripts/list-icons.js --search settings
```

---

## Color Mode

### Color Mode Constants

```typescript
import {
  DARK_COLOR_MODE_CLASSNAME,
  LIGHT_COLOR_MODE_CLASSNAME
} from '@yahoo/uds';

// Values:
// DARK_COLOR_MODE_CLASSNAME = 'uds-dark-mode'
// LIGHT_COLOR_MODE_CLASSNAME = 'uds-light-mode'
```

### Theme Toggle Implementation

```typescript
'use client';

import { useState } from 'react';
import { Box, IconButton, DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';
import { Sun, CrescentMoon } from '@yahoo/uds-icons';
import '../theme.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const colorModeClass = isDarkMode
    ? DARK_COLOR_MODE_CLASSNAME
    : LIGHT_COLOR_MODE_CLASSNAME;

  return (
    <Box className={`uds-theme-wrapper ${colorModeClass}`}>
      <IconButton
        name={isDarkMode ? Sun : CrescentMoon}
        variant="tertiary"
        aria-label="Toggle theme"
        onClick={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Rest of your app */}
    </Box>
  );
}
```

**Important:** The color mode class (`uds-dark-mode` or `uds-light-mode`) MUST be applied to the same element as your theme wrapper class for proper styling.

---

## Type Definitions

### Common Type Aliases

```typescript
// Spacing (maps to Tailwind spacing scale)
type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Semantic colors
type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'inverse';

// Component sizes
type ComponentSize = 'sm' | 'md' | 'lg';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';

// Text variants
type TextVariant =
  | 'display1' | 'display2' | 'display3'
  | 'headline1' | 'headline2' | 'headline3'
  | 'title1' | 'title2' | 'title3'
  | 'body1' | 'body2' | 'body3'
  | 'label1' | 'label2' | 'label3'
  | 'caption1' | 'caption2';

// Border radius
type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';

// Border width
type BorderWidth = 'none' | 'thin' | 'medium' | 'thick';
```

### Event Handlers

```typescript
// Click/Press events
type PressHandler = () => void;
type ClickHandler = (e: React.MouseEvent) => void;

// Input events
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type InputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => void;

// Value change events
type ValueChangeHandler<T> = (value: T) => void;
type CheckedChangeHandler = (checked: boolean) => void;
```

---

## Best Practices

### Component Selection

```typescript
// ✅ Use semantic components
<Button variant="primary" onPress={handleSubmit}>Submit</Button>

// ❌ Avoid generic divs when semantic components exist
<div onClick={handleSubmit} style={{ ... }}>Submit</div>

// ✅ Use layout components
<VStack spacing="4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>

// ❌ Avoid manual spacing
<div>
  <div style={{ marginBottom: '16px' }}>Item 1</div>
  <div>Item 2</div>
</div>
```

### Accessibility

```typescript
// ✅ Always provide aria-label for icon buttons
<IconButton name={Close} aria-label="Close dialog" onClick={handleClose} />

// ✅ Use FormLabel with inputs
<FormLabel htmlFor="email">Email</FormLabel>
<Input id="email" type="email" />

// ✅ Use semantic HTML elements
<Text as="h1" variant="display1">Page Title</Text>

// ✅ Provide alt text for images
<Image src="/photo.jpg" alt="User profile photo" />
```

### Performance

```typescript
// ✅ Use server components when possible
import { Box, Text, VStack } from '@yahoo/uds';

export default function StaticContent() {
  return (
    <VStack spacing="4">
      <Text variant="headline1">Title</Text>
      <Text variant="body1">Static content...</Text>
    </VStack>
  );
}

// ✅ Add 'use client' only when needed
'use client';
import { Button } from '@yahoo/uds';
import { useState } from 'react';

export default function InteractiveContent() {
  const [count, setCount] = useState(0);
  return <Button onPress={() => setCount(count + 1)}>Count: {count}</Button>;
}
```

### Styling

```typescript
// ✅ Use UDS semantic colors
<Box backgroundColor="primary" borderColor="secondary">
  <Text color="primary">Content</Text>
</Box>

// ✅ Use spacing props
<Box padding="4" margin="2">Content</Box>

// ✅ Combine with Tailwind when needed
<Box backgroundColor="primary" className="shadow-lg hover:shadow-xl transition-shadow">
  Content
</Box>

// ❌ Avoid inline styles when UDS props exist
<Box style={{ backgroundColor: '#fff', padding: '16px' }}>Content</Box>
```

---

## Additional Resources

- **[UDS_COMPONENTS_REFERENCE.md](UDS_COMPONENTS_REFERENCE.md)** - Complete list of all 625+ icons
- **[COMPONENT_EXAMPLES.md](COMPONENT_EXAMPLES.md)** - More usage examples
- **[COLOR_PALETTE.md](COLOR_PALETTE.md)** - Available colors and theming
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[EXAMPLE_EMAIL_APP.md](EXAMPLE_EMAIL_APP.md)** - Full application example

## Scripts

Extract component information programmatically:

```bash
# Get detailed component API
node .claude/skills/uds-helper/scripts/get-component-info.js Button

# List all components
node .claude/skills/uds-helper/scripts/list-components.js

# Generate complete reference
node .claude/skills/uds-helper/scripts/generate-reference.js
```
