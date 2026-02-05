# UDS Color Palette Reference

## Available Hues

- `carbon` - Neutral grays with warm undertones
- `gray` - Pure neutral grays
- `blue` - Info/primary actions
- `red` - Errors/alerts
- `green` - Success/positive
- `orange` - Warnings
- `purple` - Brand colors

## Available Steps (0-15)

- `0-3` - Light backgrounds
- `4-8` - Medium tones
- `9-12` - Dark tones
- `13-15` - Very dark

## Common Palette Assignments

### Light Mode Defaults

```typescript
background.primary: { hue: "gray", step: "0" }      // Page background
background.secondary: { hue: "carbon", step: "2" }  // Cards, panels
background.accent: { hue: "carbon", step: "2" }     // Highlighted areas
foreground.primary: { hue: "carbon", step: "13" }   // Main text
foreground.secondary: { hue: "carbon", step: "10" } // Secondary text
foreground.tertiary: { hue: "gray", step: "9" }     // Tertiary text
foreground.muted: { hue: "gray", step: "8" }        // Placeholder text
line.primary: { hue: "gray", step: "12" }           // Strong borders
line.secondary: { hue: "gray", step: "9" }          // Medium borders
line.tertiary: { hue: "gray", step: "7" }           // Subtle borders
line.muted: { hue: "gray", step: "3" }              // Very subtle borders
```

### Dark Mode Defaults

```typescript
background.primary: { hue: "carbon", step: "2" }    // Page background
background.secondary: { hue: "carbon", step: "3" }  // Cards, panels
background.accent: { hue: "carbon", step: "4" }     // Highlighted areas
foreground.primary: { hue: "carbon", step: "13" }   // Main text
foreground.secondary: { hue: "carbon", step: "10" } // Secondary text
foreground.tertiary: { hue: "gray", step: "9" }     // Tertiary text
foreground.muted: { hue: "gray", step: "8" }        // Placeholder text
line.primary: { hue: "gray", step: "12" }           // Strong borders
line.secondary: { hue: "gray", step: "9" }          // Medium borders
line.tertiary: { hue: "gray", step: "7" }           // Subtle borders
line.muted: { hue: "carbon", step: "5" }            // Very subtle borders
```

## Semantic Colors

- Brand: `purple/9-10`
- Info: `blue/8`, `blue/12`
- Success: `green/9`, `green/12`
- Warning: `orange/8`, `orange/12`
- Error: `red/10`, `red/11`

## Customization Example

To adjust background darkness:

```typescript
"light": {
  "palette": {
    "background": {
      "primary": { "hue": "gray", "step": "1" }  // Darker than default "0"
    }
  }
}
```
