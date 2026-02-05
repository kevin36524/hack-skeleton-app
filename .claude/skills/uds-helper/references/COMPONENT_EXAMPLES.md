# UDS Component Examples

## Common Imports

```typescript
// Layout components
import { Box, VStack, HStack, Grid } from '@yahoo/uds';

// Text components
import { Text, Heading } from '@yahoo/uds';

// Interactive components
import { Button, Badge, Chip, IconButton } from '@yahoo/uds';

// Other components
import { AvatarText, Divider } from '@yahoo/uds';

// Color mode constants
import { DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';

// Icons
import { Sun, CrescentMoon, Star, Check, Inbox, Trash } from '@yahoo/uds-icons';
```

## Layout Examples

### Box with Styling

```typescript
<Box
  backgroundColor="primary"
  borderColor="secondary"
  borderWidth="thin"
  borderRadius="medium"
  padding="4"
>
  <Text variant="display1" color="primary">Title</Text>
  <Text variant="body1" color="secondary">Description</Text>
</Box>
```

### Vertical Stack

```typescript
<VStack spacing="4" gap="4" alignItems="flex-start" justifyContent="flex-start">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</VStack>
```

### Horizontal Stack

```typescript
<HStack spacing="2" gap="2" alignItems="center" justifyContent="space-between">
  <Badge>New</Badge>
  <Badge variant="positive">Active</Badge>
</HStack>
```

## Interactive Components

### Button with Icon

```typescript
<Button
  variant="primary"
  size="md"
  startIcon={Check}
  onPress={() => console.log('clicked')}
>
  Submit
</Button>
```

### Icon Button

```typescript
<IconButton
  name={Trash}
  variant="tertiary"
  size="sm"
  aria-label="Delete"
  onClick={handleDelete}
/>
```

### Avatar

```typescript
<AvatarText initials="SJ" size="md" />
```

## Text Components

```typescript
<Text variant="display1" color="primary">Display Heading</Text>
<Text variant="headline1" color="primary">Headline</Text>
<Text variant="title3" color="primary">Title</Text>
<Text variant="body1" color="secondary">Body text</Text>
<Text variant="label2" color="brand">Label</Text>
<Text variant="caption1" color="secondary">Caption</Text>
```

## Common Patterns

### Card Layout

```typescript
<Box
  display="flex"
  flexDirection="column"
  spacing="4"
  borderWidth="thin"
  borderColor="secondary"
  borderRadius="md"
  backgroundColor="secondary"
>
  <Text variant="headline1" color="primary">Card Title</Text>
  <Text variant="body1" color="secondary">Card content goes here</Text>
</Box>
```

### List Item

```typescript
<HStack
  gap="3"
  alignItems="center"
  justifyContent="space-between"
  spacing="2"
  borderRadius="md"
  className="cursor-pointer hover:bg-[var(--color-bg-secondary)]"
>
  <Icon name={Inbox} size="sm" color="secondary" />
  <Text variant="label2" color="primary">Inbox</Text>
  <Badge variant="brand" size="sm">12</Badge>
</HStack>
```

### Theme Toggle

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

## Theme Persistence

```typescript
// With localStorage
const [isDarkMode, setIsDarkMode] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  }
  return false;
});

useEffect(() => {
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}, [isDarkMode]);

// With system preference
const [isDarkMode, setIsDarkMode] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
});
```
