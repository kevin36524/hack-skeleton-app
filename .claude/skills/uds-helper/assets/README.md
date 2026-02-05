# UDS Helper Assets

This directory contains bundled assets that are used in the output Claude produces when helping with UDS themes and applications.

## Directory Structure

```
assets/
└── examples/           # Complete working example files
    ├── README.md       # Example usage guide
    ├── email.config.ts            # Production theme config (545KB)
    ├── tailwind.config.email.ts   # Tailwind configuration
    ├── email.css                  # Theme CSS file
    └── email-page.tsx             # Complete email app (559 lines)
```

## What's in Assets?

### examples/

Complete, production-ready example files for building a UDS email theme:

- **email.config.ts** - Full theme configuration with ~20,000 lines of component tokens, color palettes, typography, and more
- **tailwind.config.email.ts** - Tailwind CSS configuration for the email theme
- **email.css** - CSS file that references the Tailwind config
- **email-page.tsx** - Complete email client UI implementation

These files are **not meant to be loaded into context**, but rather:
- Copied by users into their projects as starting templates
- Referenced by Claude to suggest patterns
- Used as complete working examples

## How Claude Uses These

When users ask for help with UDS themes:

1. **User:** "How do I create a UDS theme?"
2. **Claude:** References the bundled examples in responses
3. **Claude:** Can suggest copying files: `cp assets/examples/email.config.ts ./my-theme.config.ts`
4. **Claude:** Can read specific files if needed to show patterns

## Benefits of Bundled Assets

✅ **Self-Contained** - Skill works without requiring specific project files
✅ **Distributable** - Anyone can use these examples
✅ **Production-Ready** - Real, tested code from working application
✅ **Complete** - All files needed for a working theme

## Total Size

- email.config.ts: 545KB
- Other files: ~18KB
- **Total assets: ~563KB**

This is acceptable for a skill because:
- Assets are not loaded into context automatically
- They're accessed only when needed (file copies or pattern references)
- They provide immense value as complete working examples

## See Also

- [../references/EXAMPLE_EMAIL_APP.md](../references/EXAMPLE_EMAIL_APP.md) - Detailed breakdown of examples
- [examples/README.md](examples/README.md) - How to use the example files
