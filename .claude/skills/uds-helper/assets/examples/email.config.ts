import type { UniversalTokensConfig } from '@yahoo/uds';

export const config: UniversalTokensConfig = {
  "avatar": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "icon/variant/primary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "icon/variant/secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "sm",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "image/variant/primary/root": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        }
      },
      "image/variant/secondary/root": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/lg/icon": {
        "iconSize": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "size/lg/root": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "12",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "title4",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "12",
            "valueType": "alias"
          }
        }
      },
      "size/md/icon": {
        "iconSize": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "10",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "headline1",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "10",
            "valueType": "alias"
          }
        }
      },
      "size/sm/icon": {
        "iconSize": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "7",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "caption2",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "7",
            "valueType": "alias"
          }
        }
      },
      "size/xl/icon": {
        "iconSize": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "size/xl/root": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "16",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "title3",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "16",
            "valueType": "alias"
          }
        }
      },
      "size/xs/icon": {
        "iconSize": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/xs/root": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "caption1",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        }
      },
      "text/variant/primary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "text/variant/secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "sm",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "badge": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "size/lg/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "size/lg/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/md/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/sm/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "size/xs/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/xs/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "0.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui3",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/brand/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/brand/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/info-secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/info-secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "info-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "info-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/info/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/info/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/positive/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/positive/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "positive",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "positive",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-secondary/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-secondary/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/warning/icon": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/warning/root": {
        "backgroundColor": {
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "warning",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "warning",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "breakpoints": {
    "2xl": {
      "type": "px",
      "value": 1536
    },
    "lg": {
      "type": "px",
      "value": 1024
    },
    "md": {
      "type": "px",
      "value": 768
    },
    "sm": {
      "type": "px",
      "value": 640
    },
    "xl": {
      "type": "px",
      "value": 1280
    }
  },
  "button": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "size/lg/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/lg/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "3.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/md/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/sm/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/xs/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "xs",
            "valueType": "alias"
          }
        }
      },
      "size/xs/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "2.5",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui3",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "red-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "up",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "red-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "up",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/brand-tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/brand/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/brand/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/info-secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        }
      },
      "variant/info-secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "blue-1",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "blue-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/info-tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        }
      },
      "variant/info-tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "blue-1",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "blue-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/info/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/info/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "info",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/positive-tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "green-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "green-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "positive-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "up",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/positive/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/positive/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "positive",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "positive",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "positive",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-14",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-15",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-14",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-15",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-secondary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-secondary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "orange-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-tertiary/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/warning-tertiary/root": {
        "backgroundColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "orange-1",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "orange-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "warning-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/warning/icon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/warning/root": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "warning",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "warning",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "warning",
            "valueType": "alias"
          }
        },
        "borderRadius": {
          "disabled": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "disabled": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "opacity": {
          "disabled": {
            "type": "opacitySteps",
            "value": "20",
            "valueType": "alias"
          }
        },
        "scaleEffect": {
          "hover": {
            "type": "scaleEffects",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "scaleEffects",
            "value": "down",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "md",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "checkbox": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "size/md/checkbox": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          }
        }
      },
      "size/sm/checkbox": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "4.5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "4.5",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label4",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/indeterminate/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/indeterminate/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/indeterminate/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-10",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/indeterminate/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-10",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/indeterminate/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/indeterminate/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-10",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/indeterminate/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-10",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/indeterminate/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/indeterminate/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/indeterminate/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/indeterminate/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/indeterminate/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/checkbox": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "disabled": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "disabled": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/checkboxIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/root": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "chip": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "dismissible/variant/brand-secondary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/brand-secondary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/brand/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/brand/root": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/primary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/primary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/secondary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "dismissible/variant/secondary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "link/variant/brand-secondary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "link/variant/brand-secondary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "link/variant/brand/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "link/variant/brand/root": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "link/variant/primary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "link/variant/primary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "link/variant/secondary/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "link/variant/secondary/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "size/md/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/sm/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "full",
            "valueType": "alias"
          }
        },
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand-secondary/active/off/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand-secondary/active/off/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand-secondary/active/on/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand-secondary/active/on/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand/active/off/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand/active/off/root": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand/active/on/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/brand/active/on/root": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/primary/active/off/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/primary/active/off/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-5",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/primary/active/on/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/primary/active/on/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/secondary/active/off/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/secondary/active/off/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-4",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "accent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "lg-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/secondary/active/on/icon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "toggle/variant/secondary/active/on/root": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "carbon-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "hover": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          }
        },
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "sm",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "colorMode": {
    "light": {
      "palette": {
        "background": {
          "accent": {
            "hue": "carbon",
            "step": "3"
          },
          "alert": {
            "hue": "red",
            "step": "7"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "3"
          },
          "brand": {
            "hue": "purple",
            "step": "8"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "1"
          },
          "info": {
            "hue": "blue",
            "step": "5"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "3"
          },
          "positive": {
            "hue": "green",
            "step": "5"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "1"
          },
          "primary": {
            "hue": "carbon",
            "step": "2"
          },
          "secondary": {
            "hue": "carbon",
            "step": "2"
          },
          "warning": {
            "hue": "orange",
            "step": "5"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "3"
          }
        },
        "foreground": {
          "accent": {
            "hue": "carbon",
            "step": "7"
          },
          "alert": {
            "hue": "red",
            "step": "10"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "11"
          },
          "brand": {
            "hue": "purple",
            "step": "9"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "10"
          },
          "info": {
            "hue": "blue",
            "step": "8"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "12"
          },
          "muted": {
            "hue": "gray",
            "step": "8"
          },
          "on-color": {
            "hue": "carbon",
            "step": "15"
          },
          "positive": {
            "hue": "green",
            "step": "9"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "8"
          },
          "primary": {
            "hue": "carbon",
            "step": "13"
          },
          "secondary": {
            "hue": "carbon",
            "step": "10"
          },
          "tertiary": {
            "hue": "gray",
            "step": "9"
          },
          "warning": {
            "hue": "orange",
            "step": "8"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "12"
          }
        },
        "line": {
          "accent": {
            "hue": "carbon",
            "step": "5"
          },
          "alert": {
            "hue": "red",
            "step": "10"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "11"
          },
          "brand": {
            "hue": "purple",
            "step": "9"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "10"
          },
          "info": {
            "hue": "blue",
            "step": "6"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "6"
          },
          "muted": {
            "hue": "gray",
            "step": "3"
          },
          "positive": {
            "hue": "green",
            "step": "9"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "8"
          },
          "primary": {
            "hue": "gray",
            "step": "12"
          },
          "secondary": {
            "hue": "gray",
            "step": "9"
          },
          "tertiary": {
            "hue": "gray",
            "step": "7"
          },
          "warning": {
            "hue": "orange",
            "step": "8"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "12"
          }
        },
        "shadow": {
          "primary": {
            "hue": "carbon",
            "step": "0"
          },
          "secondary": {
            "hue": "purple",
            "step": "9"
          }
        }
      },
      "spectrum": {
        "blue": {
          "0": "0 10 38",
          "1": "0 14 57",
          "2": "0 19 75",
          "3": "0 29 102",
          "4": "0 44 129",
          "5": "0 63 156",
          "6": "0 87 183",
          "7": "0 116 210",
          "8": "17 148 236",
          "9": "18 169 255",
          "10": "99 192 255",
          "11": "125 203 255",
          "12": "150 210 250",
          "13": "182 224 252",
          "14": "213 237 252",
          "15": "240 247 252"
        },
        "brown": {
          "0": "38 23 0",
          "1": "52 31 1",
          "2": "66 40 2",
          "3": "95 58 5",
          "4": "123 75 10",
          "5": "148 92 19",
          "6": "168 108 31",
          "7": "186 123 46",
          "8": "200 138 66",
          "9": "209 150 80",
          "10": "219 165 103",
          "11": "224 176 122",
          "12": "229 190 148",
          "13": "239 210 180",
          "14": "248 230 212",
          "15": "255 249 242"
        },
        "carbon": {
          "0": "0 0 0",
          "1": "10 10 10",
          "2": "20 20 20",
          "3": "31 31 31",
          "4": "41 41 41",
          "5": "50 50 50",
          "6": "68 68 68",
          "7": "90 90 90",
          "8": "117 117 117",
          "9": "142 142 142",
          "10": "176 176 176",
          "11": "205 205 205",
          "12": "227 227 227",
          "13": "245 245 245",
          "14": "252 251 251",
          "15": "255 255 255"
        },
        "citron": {
          "0": "38 35 0",
          "1": "42 39 0",
          "2": "49 46 0",
          "3": "61 58 0",
          "4": "78 76 0",
          "5": "101 99 0",
          "6": "128 125 0",
          "7": "153 153 0",
          "8": "184 188 0",
          "9": "205 212 0",
          "10": "222 231 23",
          "11": "235 244 87",
          "12": "237 243 116",
          "13": "243 249 158",
          "14": "249 253 193",
          "15": "254 255 238"
        },
        "cyan": {
          "0": "0 22 38",
          "1": "0 32 54",
          "2": "1 42 69",
          "3": "3 65 100",
          "4": "8 89 130",
          "5": "15 114 156",
          "6": "26 138 178",
          "7": "41 161 197",
          "8": "60 182 213",
          "9": "72 192 219",
          "10": "100 210 232",
          "11": "124 227 242",
          "12": "145 239 250",
          "13": "179 244 249",
          "14": "212 251 253",
          "15": "242 255 255"
        },
        "gray": {
          "0": "0 0 0",
          "1": "16 21 24",
          "2": "29 34 40",
          "3": "35 42 49",
          "4": "44 54 63",
          "5": "70 78 86",
          "6": "91 99 106",
          "7": "110 119 128",
          "8": "130 138 147",
          "9": "151 158 168",
          "10": "176 185 193",
          "11": "199 205 210",
          "12": "224 228 233",
          "13": "240 243 245",
          "14": "245 248 250",
          "15": "255 255 255"
        },
        "green": {
          "0": "7 33 23",
          "1": "7 43 29",
          "2": "8 48 32",
          "3": "8 55 36",
          "4": "11 70 44",
          "5": "14 91 55",
          "6": "18 118 68",
          "7": "23 149 83",
          "8": "29 181 97",
          "9": "26 197 103",
          "10": "55 219 115",
          "11": "91 235 126",
          "12": "128 242 143",
          "13": "169 251 169",
          "14": "213 255 208",
          "15": "247 255 245"
        },
        "indigo": {
          "0": "8 2 38",
          "1": "13 4 65",
          "2": "17 5 91",
          "3": "20 7 117",
          "4": "22 9 144",
          "5": "26 13 171",
          "6": "39 32 187",
          "7": "60 63 219",
          "8": "93 94 255",
          "9": "112 117 242",
          "10": "135 146 242",
          "11": "163 175 251",
          "12": "189 198 255",
          "13": "211 214 255",
          "14": "232 233 255",
          "15": "252 253 255"
        },
        "lime": {
          "0": "20 38 0",
          "1": "34 51 0",
          "2": "41 63 0",
          "3": "53 83 0",
          "4": "65 104 2",
          "5": "79 125 11",
          "6": "94 145 24",
          "7": "110 166 40",
          "8": "127 187 60",
          "9": "137 199 70",
          "10": "151 209 90",
          "11": "168 224 121",
          "12": "184 237 148",
          "13": "209 247 186",
          "14": "226 255 211",
          "15": "244 255 240"
        },
        "magenta": {
          "0": "46 5 44",
          "1": "63 6 58",
          "2": "80 8 72",
          "3": "96 11 86",
          "4": "113 13 99",
          "5": "138 23 122",
          "6": "163 38 148",
          "7": "188 61 177",
          "8": "195 87 196",
          "9": "194 116 205",
          "10": "198 145 213",
          "11": "206 172 222",
          "12": "217 195 230",
          "13": "228 215 238",
          "14": "239 231 247",
          "15": "249 244 255"
        },
        "mint": {
          "0": "0 31 25",
          "1": "0 41 34",
          "2": "0 49 41",
          "3": "0 62 52",
          "4": "0 81 64",
          "5": "0 106 77",
          "6": "29 130 89",
          "7": "33 150 104",
          "8": "39 171 116",
          "9": "72 194 129",
          "10": "106 212 153",
          "11": "149 222 182",
          "12": "181 232 204",
          "13": "209 244 224",
          "14": "227 252 237",
          "15": "242 255 248"
        },
        "nude": {
          "0": "20 0 0",
          "1": "33 0 0",
          "2": "46 0 0",
          "3": "67 0 0",
          "4": "89 20 18",
          "5": "110 46 42",
          "6": "132 73 66",
          "7": "154 99 90",
          "8": "175 124 112",
          "9": "188 136 121",
          "10": "200 147 131",
          "11": "222 169 149",
          "12": "230 189 170",
          "13": "239 208 191",
          "14": "247 224 210",
          "15": "255 240 229"
        },
        "orange": {
          "0": "38 15 0",
          "1": "46 17 0",
          "2": "54 19 0",
          "3": "67 23 0",
          "4": "86 28 0",
          "5": "111 34 0",
          "6": "142 41 0",
          "7": "177 54 0",
          "8": "229 80 0",
          "9": "253 97 0",
          "10": "255 123 41",
          "11": "255 145 77",
          "12": "255 161 102",
          "13": "255 192 153",
          "14": "255 224 204",
          "15": "255 246 240"
        },
        "pink": {
          "0": "38 0 19",
          "1": "48 0 23",
          "2": "58 0 27",
          "3": "75 0 34",
          "4": "96 0 43",
          "5": "123 0 54",
          "6": "157 0 67",
          "7": "194 0 81",
          "8": "233 0 107",
          "9": "255 0 128",
          "10": "255 54 161",
          "11": "255 101 186",
          "12": "255 150 211",
          "13": "255 186 228",
          "14": "255 212 240",
          "15": "255 229 247"
        },
        "purple": {
          "0": "25 0 38",
          "1": "34 0 57",
          "2": "42 0 75",
          "3": "51 0 102",
          "4": "57 0 125",
          "5": "80 21 176",
          "6": "96 1 210",
          "7": "108 36 242",
          "8": "119 89 255",
          "9": "144 124 255",
          "10": "165 149 248",
          "11": "187 174 249",
          "12": "209 201 251",
          "13": "225 219 252",
          "14": "235 232 254",
          "15": "248 244 255"
        },
        "red": {
          "0": "38 3 0",
          "1": "57 3 0",
          "2": "75 3 0",
          "3": "102 1 0",
          "4": "129 5 0",
          "5": "156 15 12",
          "6": "183 28 27",
          "7": "210 46 47",
          "8": "232 58 62",
          "9": "255 77 82",
          "10": "255 105 109",
          "11": "255 135 141",
          "12": "255 155 161",
          "13": "255 183 188",
          "14": "254 210 214",
          "15": "255 240 241"
        },
        "rose": {
          "0": "28 4 11",
          "1": "38 5 15",
          "2": "50 18 27",
          "3": "66 22 35",
          "4": "87 27 44",
          "5": "113 35 57",
          "6": "158 49 80",
          "7": "191 58 96",
          "8": "214 87 124",
          "9": "221 108 141",
          "10": "228 131 159",
          "11": "245 164 188",
          "12": "255 193 211",
          "13": "255 214 226",
          "14": "255 233 240",
          "15": "255 251 252"
        },
        "sunset": {
          "0": "38 8 0",
          "1": "54 11 0",
          "2": "69 15 0",
          "3": "100 20 0",
          "4": "130 26 0",
          "5": "156 40 12",
          "6": "178 58 31",
          "7": "197 79 53",
          "8": "213 101 78",
          "9": "219 112 90",
          "10": "225 124 104",
          "11": "235 147 131",
          "12": "243 171 158",
          "13": "249 194 185",
          "14": "253 218 212",
          "15": "255 241 238"
        },
        "teal": {
          "0": "0 35 38",
          "1": "0 40 43",
          "2": "0 45 49",
          "3": "0 56 60",
          "4": "0 73 76",
          "5": "0 97 99",
          "6": "0 126 127",
          "7": "1 160 159",
          "8": "15 194 190",
          "9": "17 211 205",
          "10": "52 227 222",
          "11": "99 237 231",
          "12": "145 249 243",
          "13": "185 255 251",
          "14": "216 255 252",
          "15": "242 255 254"
        },
        "yellow": {
          "0": "38 35 0",
          "1": "48 42 0",
          "2": "58 49 0",
          "3": "75 60 0",
          "4": "96 73 0",
          "5": "123 91 0",
          "6": "157 112 0",
          "7": "194 136 0",
          "8": "233 171 0",
          "9": "255 204 0",
          "10": "255 220 79",
          "11": "255 232 102",
          "12": "255 243 138",
          "13": "255 249 163",
          "14": "255 251 197",
          "15": "255 253 238"
        }
      }
    },
    "dark": {
      "palette": {
        "background": {
          "accent": {
            "hue": "carbon",
            "step": "2"
          },
          "alert": {
            "hue": "red",
            "step": "9"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "2"
          },
          "brand": {
            "hue": "purple",
            "step": "9"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "1"
          },
          "info": {
            "hue": "blue",
            "step": "5"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "1"
          },
          "positive": {
            "hue": "green",
            "step": "5"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "2"
          },
          "primary": {
            "hue": "gray",
            "step": "0"
          },
          "secondary": {
            "hue": "carbon",
            "step": "2"
          },
          "warning": {
            "hue": "orange",
            "step": "5"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "2"
          }
        },
        "foreground": {
          "accent": {
            "hue": "carbon",
            "step": "7"
          },
          "alert": {
            "hue": "red",
            "step": "10"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "11"
          },
          "brand": {
            "hue": "purple",
            "step": "9"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "10"
          },
          "info": {
            "hue": "blue",
            "step": "8"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "12"
          },
          "muted": {
            "hue": "gray",
            "step": "8"
          },
          "on-color": {
            "hue": "gray",
            "step": "0"
          },
          "positive": {
            "hue": "green",
            "step": "9"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "12"
          },
          "primary": {
            "hue": "carbon",
            "step": "13"
          },
          "secondary": {
            "hue": "carbon",
            "step": "10"
          },
          "tertiary": {
            "hue": "gray",
            "step": "9"
          },
          "warning": {
            "hue": "orange",
            "step": "8"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "12"
          }
        },
        "line": {
          "accent": {
            "hue": "carbon",
            "step": "4"
          },
          "alert": {
            "hue": "red",
            "step": "10"
          },
          "alert-secondary": {
            "hue": "red",
            "step": "11"
          },
          "brand": {
            "hue": "purple",
            "step": "9"
          },
          "brand-secondary": {
            "hue": "purple",
            "step": "10"
          },
          "info": {
            "hue": "blue",
            "step": "6"
          },
          "info-secondary": {
            "hue": "blue",
            "step": "6"
          },
          "muted": {
            "hue": "gray",
            "step": "3"
          },
          "positive": {
            "hue": "green",
            "step": "9"
          },
          "positive-secondary": {
            "hue": "green",
            "step": "12"
          },
          "primary": {
            "hue": "gray",
            "step": "12"
          },
          "secondary": {
            "hue": "gray",
            "step": "9"
          },
          "tertiary": {
            "hue": "gray",
            "step": "7"
          },
          "warning": {
            "hue": "orange",
            "step": "8"
          },
          "warning-secondary": {
            "hue": "orange",
            "step": "12"
          }
        },
        "shadow": {
          "primary": {
            "hue": "carbon",
            "step": "12"
          },
          "secondary": {
            "hue": "purple",
            "step": "9"
          }
        }
      },
      "spectrum": {
        "blue": {
          "0": "242 250 255",
          "1": "223 242 255",
          "2": "202 234 255",
          "3": "162 218 255",
          "4": "125 203 255",
          "5": "89 189 255",
          "6": "18 169 255",
          "7": "24 143 255",
          "8": "15 105 255",
          "9": "0 99 235",
          "10": "0 89 222",
          "11": "0 72 196",
          "12": "0 55 164",
          "13": "0 39 126",
          "14": "0 23 83",
          "15": "0 10 38"
        },
        "brown": {
          "0": "255 253 250",
          "1": "255 246 224",
          "2": "255 236 209",
          "3": "251 221 191",
          "4": "237 199 159",
          "5": "217 170 118",
          "6": "185 136 79",
          "7": "151 104 47",
          "8": "134 90 35",
          "9": "117 76 25",
          "10": "91 56 11",
          "11": "71 42 4",
          "12": "55 33 1",
          "13": "45 27 0",
          "14": "38 23 0",
          "15": "26 16 0"
        },
        "carbon": {
          "0": "255 255 255",
          "1": "252 251 251",
          "2": "245 245 245",
          "3": "227 227 227",
          "4": "205 205 205",
          "5": "176 176 176",
          "6": "142 142 142",
          "7": "106 106 106",
          "8": "90 90 90",
          "9": "68 68 68",
          "10": "50 50 50",
          "11": "41 41 41",
          "12": "31 31 31",
          "13": "20 20 20",
          "14": "10 10 10",
          "15": "0 0 0"
        },
        "citron": {
          "0": "253 255 230",
          "1": "249 253 193",
          "2": "245 252 158",
          "3": "235 244 87",
          "4": "222 231 23",
          "5": "205 212 0",
          "6": "184 188 0",
          "7": "158 159 0",
          "8": "122 122 0",
          "9": "115 113 0",
          "10": "101 99 0",
          "11": "78 76 0",
          "12": "61 58 0",
          "13": "49 46 0",
          "14": "42 39 0",
          "15": "38 35 0"
        },
        "cyan": {
          "0": "245 255 255",
          "1": "223 255 255",
          "2": "201 255 255",
          "3": "161 245 251",
          "4": "121 229 240",
          "5": "85 205 223",
          "6": "54 177 201",
          "7": "29 146 174",
          "8": "20 114 142",
          "9": "19 100 126",
          "10": "17 86 111",
          "11": "13 64 86",
          "12": "10 48 67",
          "13": "9 37 53",
          "14": "8 29 44",
          "15": "4 18 28"
        },
        "gray": {
          "0": "255 255 255",
          "1": "245 248 250",
          "2": "240 243 245",
          "3": "224 228 233",
          "4": "199 205 210",
          "5": "176 185 193",
          "6": "151 158 168",
          "7": "130 138 147",
          "8": "110 119 128",
          "9": "91 99 106",
          "10": "70 78 86",
          "11": "44 54 63",
          "12": "35 42 49",
          "13": "29 34 40",
          "14": "16 21 24",
          "15": "0 0 0"
        },
        "green": {
          "0": "246 255 244",
          "1": "225 253 220",
          "2": "202 250 197",
          "3": "162 242 162",
          "4": "126 228 135",
          "5": "86 196 112",
          "6": "48 161 89",
          "7": "0 135 81",
          "8": "10 122 68",
          "9": "0 108 59",
          "10": "4 94 52",
          "11": "4 77 44",
          "12": "4 59 35",
          "13": "4 51 31",
          "14": "4 43 27",
          "15": "3 33 21"
        },
        "indigo": {
          "0": "242 244 255",
          "1": "226 230 255",
          "2": "209 213 255",
          "3": "184 188 255",
          "4": "156 160 255",
          "5": "130 130 255",
          "6": "109 110 255",
          "7": "93 94 255",
          "8": "64 64 227",
          "9": "32 21 194",
          "10": "26 13 171",
          "11": "22 9 144",
          "12": "18 5 118",
          "13": "15 3 91",
          "14": "11 1 65",
          "15": "6 0 38"
        },
        "lime": {
          "0": "249 255 245",
          "1": "237 255 224",
          "2": "230 255 209",
          "3": "217 250 190",
          "4": "202 239 168",
          "5": "172 222 122",
          "6": "137 199 70",
          "7": "101 169 21",
          "8": "75 133 0",
          "9": "70 122 0",
          "10": "62 107 0",
          "11": "50 83 0",
          "12": "40 65 0",
          "13": "33 51 0",
          "14": "28 43 0",
          "15": "26 38 0"
        },
        "magenta": {
          "0": "244 235 255",
          "1": "236 217 251",
          "2": "229 199 247",
          "3": "223 182 243",
          "4": "220 166 240",
          "5": "212 136 227",
          "6": "207 109 214",
          "7": "201 84 199",
          "8": "188 61 177",
          "9": "164 46 151",
          "10": "140 32 126",
          "11": "116 22 103",
          "12": "92 13 81",
          "13": "68 6 60",
          "14": "44 2 39",
          "15": "20 0 18"
        },
        "mint": {
          "0": "245 255 249",
          "1": "231 252 240",
          "2": "218 248 232",
          "3": "201 239 219",
          "4": "174 224 199",
          "5": "133 203 172",
          "6": "88 179 142",
          "7": "45 151 113",
          "8": "12 122 88",
          "9": "1 109 78",
          "10": "1 96 71",
          "11": "0 74 57",
          "12": "0 58 46",
          "13": "0 47 38",
          "14": "0 41 33",
          "15": "0 28 23"
        },
        "nude": {
          "0": "255 245 245",
          "1": "251 222 221",
          "2": "248 203 196",
          "3": "235 185 172",
          "4": "222 169 149",
          "5": "202 155 136",
          "6": "182 139 122",
          "7": "162 122 106",
          "8": "142 104 89",
          "9": "131 93 80",
          "10": "120 83 71",
          "11": "100 61 48",
          "12": "80 34 19",
          "13": "60 14 0",
          "14": "40 9 0",
          "15": "20 4 0"
        },
        "orange": {
          "0": "255 249 242",
          "1": "255 239 222",
          "2": "255 229 202",
          "3": "249 208 167",
          "4": "252 182 111",
          "5": "255 158 66",
          "6": "255 137 21",
          "7": "226 105 0",
          "8": "204 78 0",
          "9": "191 73 0",
          "10": "166 64 0",
          "11": "145 56 0",
          "12": "115 44 0",
          "13": "94 37 1",
          "14": "68 26 0",
          "15": "38 15 0"
        },
        "pink": {
          "0": "255 247 252",
          "1": "255 235 249",
          "2": "254 216 247",
          "3": "255 176 231",
          "4": "255 133 211",
          "5": "255 85 195",
          "6": "255 54 161",
          "7": "255 0 128",
          "8": "230 0 115",
          "9": "220 2 118",
          "10": "178 6 102",
          "11": "113 0 75",
          "12": "85 0 58",
          "13": "56 0 40",
          "14": "45 0 34",
          "15": "38 0 16"
        },
        "purple": {
          "0": "248 244 255",
          "1": "235 229 255",
          "2": "225 217 255",
          "3": "213 207 255",
          "4": "202 194 255",
          "5": "176 159 252",
          "6": "149 126 252",
          "7": "131 103 255",
          "8": "124 73 252",
          "9": "125 46 255",
          "10": "96 1 210",
          "11": "80 21 176",
          "12": "57 0 125",
          "13": "43 0 103",
          "14": "29 0 71",
          "15": "16 0 38"
        },
        "red": {
          "0": "255 250 250",
          "1": "255 240 241",
          "2": "255 231 232",
          "3": "255 214 218",
          "4": "255 187 192",
          "5": "255 152 159",
          "6": "253 106 116",
          "7": "255 77 82",
          "8": "238 0 23",
          "9": "211 13 46",
          "10": "187 0 10",
          "11": "157 0 4",
          "12": "127 0 0",
          "13": "98 3 0",
          "14": "68 4 0",
          "15": "38 3 0"
        },
        "rose": {
          "0": "255 247 250",
          "1": "255 235 243",
          "2": "255 224 239",
          "3": "255 209 226",
          "4": "255 193 213",
          "5": "250 162 187",
          "6": "233 126 157",
          "7": "211 89 124",
          "8": "189 57 95",
          "9": "167 52 85",
          "10": "144 47 75",
          "11": "113 35 57",
          "12": "87 27 44",
          "13": "66 22 35",
          "14": "50 18 27",
          "15": "38 15 22"
        },
        "sunset": {
          "0": "255 240 238",
          "1": "251 221 218",
          "2": "247 203 199",
          "3": "234 170 163",
          "4": "221 140 130",
          "5": "209 113 99",
          "6": "196 89 71",
          "7": "184 68 46",
          "8": "171 51 24",
          "9": "158 44 18",
          "10": "145 38 12",
          "11": "124 26 1",
          "12": "102 22 0",
          "13": "81 18 0",
          "14": "60 13 0",
          "15": "38 8 0"
        },
        "teal": {
          "0": "242 255 251",
          "1": "224 255 248",
          "2": "207 255 248",
          "3": "177 255 243",
          "4": "133 247 233",
          "5": "78 232 220",
          "6": "17 211 205",
          "7": "0 160 160",
          "8": "0 130 130",
          "9": "0 122 122",
          "10": "0 110 107",
          "11": "0 89 86",
          "12": "0 69 67",
          "13": "0 54 53",
          "14": "0 44 44",
          "15": "0 38 38"
        },
        "yellow": {
          "0": "255 253 238",
          "1": "255 250 209",
          "2": "255 246 161",
          "3": "255 242 125",
          "4": "255 233 87",
          "5": "255 211 51",
          "6": "229 185 23",
          "7": "151 117 0",
          "8": "124 90 0",
          "9": "100 67 0",
          "10": "88 57 0",
          "11": "75 47 0",
          "12": "58 34 0",
          "13": "44 25 0",
          "14": "32 17 0",
          "15": "21 11 0"
        }
      }
    }
  },
  "divider": {
    "defaults": {
      "variant": "primary"
    },
    "variables": {
      "variant/muted/label": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "variant/muted/line": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        }
      },
      "variant/muted/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/label": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/line": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/label": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/line": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/label": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/line": {
        "borderColor": {
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "elevation": {
    "0": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "none",
        "fallbackBlurredBackgroundValue": {
          "b": "20",
          "g": "20",
          "r": "20",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "20",
          "g": "20",
          "r": "20",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "0",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "none",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "0",
          "type": "always",
          "value": "always/white"
        }
      }
    },
    "1": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "sm",
        "fallbackBlurredBackgroundValue": {
          "b": "29",
          "g": "29",
          "r": "29",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "29",
          "g": "29",
          "r": "29",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "4",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "sm",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "4",
          "type": "always",
          "value": "always/white"
        }
      }
    },
    "2": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "md",
        "fallbackBlurredBackgroundValue": {
          "b": "34",
          "g": "34",
          "r": "34",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "34",
          "g": "34",
          "r": "34",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "6",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "md",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "6",
          "type": "always",
          "value": "always/white"
        }
      }
    },
    "3": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "lg",
        "fallbackBlurredBackgroundValue": {
          "b": "39",
          "g": "39",
          "r": "39",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "39",
          "g": "39",
          "r": "39",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "8",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "lg",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "8",
          "type": "always",
          "value": "always/white"
        }
      }
    },
    "4": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "xl",
        "fallbackBlurredBackgroundValue": {
          "b": "44",
          "g": "44",
          "r": "44",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "44",
          "g": "44",
          "r": "44",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "10",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "xl",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "10",
          "type": "always",
          "value": "always/white"
        }
      }
    },
    "5": {
      "dark": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "2xl",
        "fallbackBlurredBackgroundValue": {
          "b": "48",
          "g": "48",
          "r": "48",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "48",
          "g": "48",
          "r": "48",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "12",
          "type": "always",
          "value": "always/white"
        }
      },
      "light": {
        "backgroundBlurRadius": 0,
        "finalBackgroundOpacity": "100",
        "backgroundFill": {
          "type": "background",
          "value": "primary"
        },
        "borderColor": {
          "type": "line",
          "value": "accent"
        },
        "borderWidth": "thin",
        "dropShadow": "2xl",
        "fallbackBlurredBackgroundValue": {
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgb"
        },
        "finalBackgroundValue": {
          "a": "100",
          "b": "255",
          "g": "255",
          "r": "255",
          "type": "rgba"
        },
        "layerWithBackgroundFill": true,
        "surfaceColor": {
          "opacity": "12",
          "type": "always",
          "value": "always/white"
        }
      }
    }
  },
  "font": {
    "mono": "roboto-mono",
    "sans": "yahoo-product-sans",
    "sans-alt": "yahoo-sans-condensed",
    "serif": "yahoo-serif-display",
    "serif-alt": "yahoo-serif-text"
  },
  "globalDefaults": {
    "breakpoint": "lg",
    "enableResponsiveType": true
  },
  "iconButton": {
    "defaults": {
      "size": "md",
      "variant": "primary"
    },
    "variables": {
      "size/lg/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/lg/root": {
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "3.5",
            "valueType": "alias"
          }
        }
      },
      "size/md/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        }
      },
      "size/sm/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "size/xl/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "size/xl/root": {
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        }
      },
      "size/xs/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/xs/root": {
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "input": {
    "defaults": {
      "size": "md",
      "variant": "default"
    },
    "variables": {
      "size/lg/endIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/lg/helperIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/lg/helperText": {
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui4",
            "valueType": "alias"
          }
        }
      },
      "size/lg/input": {
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        }
      },
      "size/lg/inputWrapper": {
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "invalid": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "3",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "3.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "hover": {
            "type": "textVariants",
            "value": "ui2",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "ui2",
            "valueType": "alias"
          }
        }
      },
      "size/lg/label": {
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui4",
            "valueType": "alias"
          }
        }
      },
      "size/lg/root": {},
      "size/lg/startIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/md/endIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "size/md/helperIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/md/helperText": {
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui4",
            "valueType": "alias"
          }
        }
      },
      "size/md/input": {
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        }
      },
      "size/md/inputWrapper": {
        "borderRadius": {
          "rest": {
            "type": "borderRadii",
            "value": "md",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "invalid": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          },
          "pressed": {
            "type": "borderWidths",
            "value": "medium",
            "valueType": "alias"
          },
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "3.5",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "hover": {
            "type": "textVariants",
            "value": "ui2",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "ui2",
            "valueType": "alias"
          }
        }
      },
      "size/md/label": {
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "ui4",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {},
      "size/md/startIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/endIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/helperIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/helperText": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/input": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/inputPlaceholder": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/inputWrapper": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "readonly": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/label": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/labelRequired": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/empty/root": {},
      "variant/default/value/empty/startIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/endIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/helperIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/helperText": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/input": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/inputPlaceholder": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/inputWrapper": {
        "backgroundColor": {
          "disabled": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "disabled": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "hover": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "spectrumColors",
            "value": "red-11",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "readonly": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/label": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/labelRequired": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/value/filled/root": {},
      "variant/default/value/filled/startIcon": {
        "color": {
          "disabled": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "focus-within": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "invalid": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "invalid&pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "readonly": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "link": {
    "defaults": {
      "textStyle": "title1",
      "variant": "primary"
    },
    "variables": {
      "textStyle/body1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/body1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/caption1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/caption1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/caption2/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "textStyle/caption2/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display2/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display2/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display3/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "lg",
            "valueType": "alias"
          }
        }
      },
      "textStyle/display3/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/headline1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/headline1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label2/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label2/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label3/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label3/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label4/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "textStyle/label4/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/legal1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/legal1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title2/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title2/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title3/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title3/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title4/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/title4/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui1/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui1/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui2/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui2/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui3/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui3/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui4/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui4/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui5/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui5/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui6/icon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "md",
            "valueType": "alias"
          }
        }
      },
      "textStyle/ui6/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        }
      },
      "variant/on-color/iconEnd": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/on-color/iconStart": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        }
      },
      "variant/on-color/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "on-color",
            "valueType": "alias"
          }
        },
        "textDecorationLine": {
          "hover": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "pressed": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "rest": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/iconEnd": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-11",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/iconStart": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-11",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-11",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "textDecorationLine": {
          "hover": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "pressed": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "rest": {
            "type": "textDecorationLines",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/iconEnd": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/iconStart": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "textDecorationLine": {
          "hover": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "pressed": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "rest": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/iconEnd": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/iconStart": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        }
      },
      "variant/tertiary/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "textDecorationLine": {
          "hover": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "pressed": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          },
          "rest": {
            "type": "textDecorationLines",
            "value": "underline",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "menu": {
    "defaults": {
      "size": "default",
      "variant": "default"
    },
    "variables": {
      "divider/variant/default/line": {
        "borderColor": {
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        }
      },
      "divider/variant/default/root": {},
      "divider/variant/default/text": {
        "color": {
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label3",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/off/icon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/off/root": {
        "backgroundColor": {
          "focused": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/off/text": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "focused": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          },
          "hover": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/on/icon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/on/root": {
        "backgroundColor": {
          "focused": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "item/variant/default/active/on/text": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "focused": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          },
          "hover": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/off/endIcon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/off/root": {
        "backgroundColor": {
          "focused": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/off/startIcon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/off/text": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "focused": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          },
          "hover": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/on/endIcon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/on/root": {
        "backgroundColor": {
          "focused": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "hover": {
            "type": "spectrumColors",
            "value": "purple-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/on/startIcon": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "itemCheckbox/variant/default/active/on/text": {
        "color": {
          "focused": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "focused": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          },
          "hover": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          },
          "rest": {
            "type": "textVariants",
            "value": "label1",
            "valueType": "alias"
          }
        }
      },
      "size/default/endIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/default/root": {},
      "size/default/startIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "motion": {
    "bouncy": {
      "1": {
        "damping": 9.22971294060014,
        "stiffness": 48.8806726225418
      },
      "2": {
        "damping": 12.6341443434966,
        "stiffness": 91.590926913664
      },
      "3": {
        "damping": 19.4021770179049,
        "stiffness": 216.003958772305
      },
      "4": {
        "damping": 37.5417231844303,
        "stiffness": 808.703255942291
      }
    },
    "damped": {
      "1": {
        "damping": 20.5857962643504,
        "stiffness": 62.379681153657
      },
      "2": {
        "damping": 29.3125512813123,
        "stiffness": 126.4780175376
      },
      "3": {
        "damping": 48.9279940135616,
        "stiffness": 352.389233653733
      },
      "4": {
        "damping": 123.426909942563,
        "stiffness": 2242.47454882114
      }
    },
    "smooth": {
      "1": {
        "damping": 16.4686370114803,
        "stiffness": 67.804001253975
      },
      "2": {
        "damping": 23.4500410250498,
        "stiffness": 137.47610601913
      },
      "3": {
        "damping": 39.1423952108493,
        "stiffness": 383.03177571058
      },
      "4": {
        "damping": 98.7415279540508,
        "stiffness": 2437.47233567515
      }
    },
    "subtle": {
      "1": {
        "damping": 13.0431605130924,
        "stiffness": 67.804001253975
      },
      "2": {
        "damping": 18.5724324918395,
        "stiffness": 137.47610601913
      },
      "3": {
        "damping": 31.0007770069926,
        "stiffness": 383.03177571058
      },
      "4": {
        "damping": 78.2032901396082,
        "stiffness": 2437.47233567515
      }
    },
    "veryBouncy": {
      "1": {
        "damping": 6.90229075494619,
        "stiffness": 38.9215274512691
      },
      "2": {
        "damping": 9.15555051421552,
        "stiffness": 68.4813482871123
      },
      "3": {
        "damping": 13.2444649081667,
        "stiffness": 143.308585708439
      },
      "4": {
        "damping": 22.1786265287673,
        "stiffness": 401.85804919503
      }
    }
  },
  "radio": {
    "defaults": {
      "size": "sm",
      "variant": "primary"
    },
    "variables": {
      "size/md/radio": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          }
        }
      },
      "size/sm/radio": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "thin",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "4.5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "4.5",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label4",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "red-11",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/checked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "red-2",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert-secondary/value/unchecked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "xl",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "xl",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/checked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/alert/value/unchecked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "alert",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-10",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/checked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-4",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "tertiary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/primary/value/unchecked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "md-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/checked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "primary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/radio": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "carbon-3",
            "valueType": "alias"
          },
          "pressed": {
            "type": "spectrumColors",
            "value": "purple-1",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "alwaysPaletteAliases",
            "value": "always/transparent",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "pressed": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/radioCircle": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand-secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/secondary/value/unchecked/root": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "pressed": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "scaleMode": {
    "large": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 16,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 32,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 4,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "medium": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 12,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 24,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 2,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "small": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 12,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 24,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 2,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "xLarge": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 16,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 32,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 4,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "xSmall": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 12,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 24,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 2,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "xxLarge": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 16,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 32,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 4,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    },
    "xxxLarge": {
      "avatarSizes": {
        "lg": 52,
        "md": 40,
        "sm": 28,
        "xl": 64,
        "xs": 24
      },
      "borderRadius": {
        "full": 9999,
        "lg": 16,
        "md": 8,
        "none": 0,
        "sm": 4,
        "xl": 32,
        "xs": 2
      },
      "borderWidth": {
        "medium": 2,
        "none": 0,
        "thick": 4,
        "thin": 1
      },
      "iconSizes": {
        "lg": 32,
        "md": 24,
        "sm": 16,
        "xs": 12
      }
    }
  },
  "shadow": {
    "drop": {
      "2xl": [
        {
          "blur": "12",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "6",
          "opacity": "25",
          "spread": "-3"
        }
      ],
      "lg": [
        {
          "blur": "1.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "1",
          "opacity": "10",
          "spread": "-1"
        },
        {
          "blur": "3.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "2.5",
          "opacity": "10",
          "spread": "-0.5"
        }
      ],
      "md": [
        {
          "blur": "6",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "4",
          "opacity": "10",
          "spread": "-1.5"
        },
        {
          "blur": "4",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "1.5",
          "opacity": "10",
          "spread": "-1.5"
        }
      ],
      "none": [],
      "sm": [
        {
          "blur": "0.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        },
        {
          "blur": "1",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        }
      ],
      "xl": [
        {
          "blur": "2.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "2",
          "opacity": "10",
          "spread": "-1.5"
        },
        {
          "blur": "6",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "5",
          "opacity": "10",
          "spread": "-1"
        }
      ],
      "xs": [
        {
          "blur": "0.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "5",
          "spread": "0"
        }
      ]
    },
    "inset": {
      "2xl": [
        {
          "blur": "12",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "6",
          "opacity": "25",
          "spread": "-3"
        }
      ],
      "2xl-invert": [
        {
          "blur": "12",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "6",
          "opacity": "25",
          "spread": "-3"
        }
      ],
      "lg": [
        {
          "blur": "1.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "1",
          "opacity": "10",
          "spread": "-1"
        },
        {
          "blur": "3.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "2.5",
          "opacity": "10",
          "spread": "-0.5"
        }
      ],
      "lg-invert": [
        {
          "blur": "1.5",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "1",
          "opacity": "10",
          "spread": "-1"
        },
        {
          "blur": "3.5",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "2.5",
          "opacity": "10",
          "spread": "-0.5"
        }
      ],
      "md": [
        {
          "blur": "6",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "4",
          "opacity": "10",
          "spread": "-1"
        },
        {
          "blur": "4",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "1.5",
          "opacity": "10",
          "spread": "-2"
        }
      ],
      "md-invert": [
        {
          "blur": "1.5",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "1",
          "opacity": "10",
          "spread": "-px"
        },
        {
          "blur": "1",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "0.5",
          "opacity": "10",
          "spread": "-0.5"
        }
      ],
      "none": [],
      "sm": [
        {
          "blur": "0.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        },
        {
          "blur": "1",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        }
      ],
      "sm-invert": [
        {
          "blur": "0.5",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        },
        {
          "blur": "1",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "10",
          "spread": "0"
        }
      ],
      "xl": [
        {
          "blur": "2.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "2",
          "opacity": "10",
          "spread": "-1.5"
        },
        {
          "blur": "6",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "5",
          "opacity": "10",
          "spread": "-1"
        }
      ],
      "xl-invert": [
        {
          "blur": "6",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "4",
          "opacity": "10",
          "spread": "-3.5"
        },
        {
          "blur": "14",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "10",
          "opacity": "10",
          "spread": "-2"
        }
      ],
      "xs": [
        {
          "blur": "0.5",
          "color": {
            "type": "palette",
            "value": "primary"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "5",
          "spread": "0"
        }
      ],
      "xs-invert": [
        {
          "blur": "0.5",
          "color": {
            "type": "always",
            "value": "always/white"
          },
          "offsetX": "0",
          "offsetY": "px",
          "opacity": "5",
          "spread": "0"
        }
      ]
    }
  },
  "switch": {
    "defaults": {
      "size": "md",
      "variant": "default"
    },
    "variables": {
      "size/md/handle": {
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "6",
            "valueType": "alias"
          }
        }
      },
      "size/md/handleIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/md/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "0",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1.5",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label2",
            "valueType": "alias"
          }
        }
      },
      "size/md/switch": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "7",
            "valueType": "alias"
          }
        },
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "0.5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "12",
            "valueType": "alias"
          }
        }
      },
      "size/sm/handle": {
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "4",
            "valueType": "alias"
          }
        }
      },
      "size/sm/handleIcon": {
        "size": {
          "rest": {
            "type": "iconSizes",
            "value": "sm",
            "valueType": "alias"
          }
        }
      },
      "size/sm/root": {
        "gap": {
          "rest": {
            "type": "spacingAliases",
            "value": "2",
            "valueType": "alias"
          }
        },
        "spacingHorizontal": {
          "rest": {
            "type": "spacingAliases",
            "value": "0",
            "valueType": "alias"
          }
        },
        "spacingVertical": {
          "rest": {
            "type": "spacingAliases",
            "value": "1",
            "valueType": "alias"
          }
        },
        "textVariant": {
          "rest": {
            "type": "textVariants",
            "value": "label4",
            "valueType": "alias"
          }
        }
      },
      "size/sm/switch": {
        "borderWidth": {
          "rest": {
            "type": "borderWidths",
            "value": "none",
            "valueType": "alias"
          }
        },
        "height": {
          "rest": {
            "type": "spacingAliases",
            "value": "5",
            "valueType": "alias"
          }
        },
        "spacing": {
          "rest": {
            "type": "spacingAliases",
            "value": "0.5",
            "valueType": "alias"
          }
        },
        "width": {
          "rest": {
            "type": "spacingAliases",
            "value": "8",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/off/handle": {
        "backgroundColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "xl",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/off/handleIcon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "muted",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/off/root": {
        "labelColor": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/off/switch": {
        "backgroundColor": {
          "hover": {
            "type": "spectrumColors",
            "value": "gray-8",
            "valueType": "alias"
          },
          "rest": {
            "type": "spectrumColors",
            "value": "gray-8",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/on/handle": {
        "backgroundColor": {
          "hover": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          },
          "rest": {
            "type": "alwaysPaletteAliases",
            "value": "always/white",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl-invert",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "xl",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/on/handleIcon": {
        "color": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/on/root": {
        "labelColor": {
          "hover": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          },
          "rest": {
            "type": "foregroundPaletteColors",
            "value": "secondary",
            "valueType": "alias"
          }
        }
      },
      "variant/default/active/on/switch": {
        "backgroundColor": {
          "hover": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "backgroundPaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "borderColor": {
          "hover": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          },
          "rest": {
            "type": "linePaletteColors",
            "value": "brand",
            "valueType": "alias"
          }
        },
        "insetShadow": {
          "hover": {
            "type": "shadowVariantsWithInvert",
            "value": "2xl",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariantsWithInvert",
            "value": "none",
            "valueType": "alias"
          }
        },
        "shadow": {
          "hover": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          },
          "rest": {
            "type": "shadowVariants",
            "value": "none",
            "valueType": "alias"
          }
        }
      }
    }
  },
  "typography": {
    "body1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 25.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 25.6
          },
          "lg": {
            "type": "px",
            "value": 25.6
          },
          "md": {
            "type": "px",
            "value": 25.6
          },
          "sm": {
            "type": "px",
            "value": 25.6
          },
          "xl": {
            "type": "px",
            "value": 25.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "body1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 25.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 25.6
          },
          "lg": {
            "type": "px",
            "value": 25.6
          },
          "md": {
            "type": "px",
            "value": 25.6
          },
          "sm": {
            "type": "px",
            "value": 25.6
          },
          "xl": {
            "type": "px",
            "value": 25.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "caption1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 12
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 12
          },
          "lg": {
            "type": "px",
            "value": 12
          },
          "md": {
            "type": "px",
            "value": 12
          },
          "sm": {
            "type": "px",
            "value": 12
          },
          "xl": {
            "type": "px",
            "value": 12
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15
          },
          "lg": {
            "type": "px",
            "value": 15
          },
          "md": {
            "type": "px",
            "value": 15
          },
          "sm": {
            "type": "px",
            "value": 15
          },
          "xl": {
            "type": "px",
            "value": 15
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "caption1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 12
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 12
          },
          "lg": {
            "type": "px",
            "value": 12
          },
          "md": {
            "type": "px",
            "value": 12
          },
          "sm": {
            "type": "px",
            "value": 12
          },
          "xl": {
            "type": "px",
            "value": 12
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15
          },
          "lg": {
            "type": "px",
            "value": 15
          },
          "md": {
            "type": "px",
            "value": 15
          },
          "sm": {
            "type": "px",
            "value": 15
          },
          "xl": {
            "type": "px",
            "value": 15
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "caption2": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 12
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 12
          },
          "lg": {
            "type": "px",
            "value": 12
          },
          "md": {
            "type": "px",
            "value": 12
          },
          "sm": {
            "type": "px",
            "value": 12
          },
          "xl": {
            "type": "px",
            "value": 12
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15
          },
          "lg": {
            "type": "px",
            "value": 15
          },
          "md": {
            "type": "px",
            "value": 15
          },
          "sm": {
            "type": "px",
            "value": 15
          },
          "xl": {
            "type": "px",
            "value": 15
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "caption2/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 12
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 12
          },
          "lg": {
            "type": "px",
            "value": 12
          },
          "md": {
            "type": "px",
            "value": 12
          },
          "sm": {
            "type": "px",
            "value": 12
          },
          "xl": {
            "type": "px",
            "value": 12
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15
          },
          "lg": {
            "type": "px",
            "value": 15
          },
          "md": {
            "type": "px",
            "value": 15
          },
          "sm": {
            "type": "px",
            "value": 15
          },
          "xl": {
            "type": "px",
            "value": 15
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 40
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 92
          },
          "lg": {
            "type": "px",
            "value": 72
          },
          "md": {
            "type": "px",
            "value": 56
          },
          "sm": {
            "type": "px",
            "value": 40
          },
          "xl": {
            "type": "px",
            "value": 80
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 46
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 100
          },
          "lg": {
            "type": "px",
            "value": 76
          },
          "md": {
            "type": "px",
            "value": 64
          },
          "sm": {
            "type": "px",
            "value": 46
          },
          "xl": {
            "type": "px",
            "value": 88
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 40
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 92
          },
          "lg": {
            "type": "px",
            "value": 72
          },
          "md": {
            "type": "px",
            "value": 56
          },
          "sm": {
            "type": "px",
            "value": 40
          },
          "xl": {
            "type": "px",
            "value": 80
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 46
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 100
          },
          "lg": {
            "type": "px",
            "value": 76
          },
          "md": {
            "type": "px",
            "value": 64
          },
          "sm": {
            "type": "px",
            "value": 46
          },
          "xl": {
            "type": "px",
            "value": 88
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display2": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 52
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 52
          },
          "lg": {
            "type": "px",
            "value": 52
          },
          "md": {
            "type": "px",
            "value": 52
          },
          "sm": {
            "type": "px",
            "value": 52
          },
          "xl": {
            "type": "px",
            "value": 52
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 57.2
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 57.2
          },
          "lg": {
            "type": "px",
            "value": 57.2
          },
          "md": {
            "type": "px",
            "value": 57.2
          },
          "sm": {
            "type": "px",
            "value": 57.2
          },
          "xl": {
            "type": "px",
            "value": 57.2
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display2/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 52
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 52
          },
          "lg": {
            "type": "px",
            "value": 52
          },
          "md": {
            "type": "px",
            "value": 52
          },
          "sm": {
            "type": "px",
            "value": 52
          },
          "xl": {
            "type": "px",
            "value": 52
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 57.2
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 57.2
          },
          "lg": {
            "type": "px",
            "value": 57.2
          },
          "md": {
            "type": "px",
            "value": 57.2
          },
          "sm": {
            "type": "px",
            "value": 57.2
          },
          "xl": {
            "type": "px",
            "value": 57.2
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display3": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 44
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 44
          },
          "lg": {
            "type": "px",
            "value": 44
          },
          "md": {
            "type": "px",
            "value": 44
          },
          "sm": {
            "type": "px",
            "value": 44
          },
          "xl": {
            "type": "px",
            "value": 44
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 48.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 48.4
          },
          "lg": {
            "type": "px",
            "value": 48.4
          },
          "md": {
            "type": "px",
            "value": 48.4
          },
          "sm": {
            "type": "px",
            "value": 48.4
          },
          "xl": {
            "type": "px",
            "value": 48.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "display3/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 44
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 44
          },
          "lg": {
            "type": "px",
            "value": 44
          },
          "md": {
            "type": "px",
            "value": 44
          },
          "sm": {
            "type": "px",
            "value": 44
          },
          "xl": {
            "type": "px",
            "value": 44
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 48.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 48.4
          },
          "lg": {
            "type": "px",
            "value": 48.4
          },
          "md": {
            "type": "px",
            "value": 48.4
          },
          "sm": {
            "type": "px",
            "value": 48.4
          },
          "xl": {
            "type": "px",
            "value": 48.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "headline1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 18
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 18
          },
          "lg": {
            "type": "px",
            "value": 18
          },
          "md": {
            "type": "px",
            "value": 18
          },
          "sm": {
            "type": "px",
            "value": 18
          },
          "xl": {
            "type": "px",
            "value": 18
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 22.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 22.5
          },
          "lg": {
            "type": "px",
            "value": 22.5
          },
          "md": {
            "type": "px",
            "value": 22.5
          },
          "sm": {
            "type": "px",
            "value": 22.5
          },
          "xl": {
            "type": "px",
            "value": 22.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "headline1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 18
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 18
          },
          "lg": {
            "type": "px",
            "value": 18
          },
          "md": {
            "type": "px",
            "value": 18
          },
          "sm": {
            "type": "px",
            "value": 18
          },
          "xl": {
            "type": "px",
            "value": 18
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 22.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 22.5
          },
          "lg": {
            "type": "px",
            "value": 22.5
          },
          "md": {
            "type": "px",
            "value": 22.5
          },
          "sm": {
            "type": "px",
            "value": 22.5
          },
          "xl": {
            "type": "px",
            "value": 22.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label2": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label2/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label3": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15.4
          },
          "lg": {
            "type": "px",
            "value": 15.4
          },
          "md": {
            "type": "px",
            "value": 15.4
          },
          "sm": {
            "type": "px",
            "value": 15.4
          },
          "xl": {
            "type": "px",
            "value": 15.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label3/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15.4
          },
          "lg": {
            "type": "px",
            "value": 15.4
          },
          "md": {
            "type": "px",
            "value": 15.4
          },
          "sm": {
            "type": "px",
            "value": 15.4
          },
          "xl": {
            "type": "px",
            "value": 15.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label4": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "label4/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "legal1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 11
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 11
          },
          "lg": {
            "type": "px",
            "value": 11
          },
          "md": {
            "type": "px",
            "value": 11
          },
          "sm": {
            "type": "px",
            "value": 11
          },
          "xl": {
            "type": "px",
            "value": 11
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 20
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 20
          },
          "lg": {
            "type": "px",
            "value": 20
          },
          "md": {
            "type": "px",
            "value": 20
          },
          "sm": {
            "type": "px",
            "value": 20
          },
          "xl": {
            "type": "px",
            "value": 20
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "legal1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 11
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 11
          },
          "lg": {
            "type": "px",
            "value": 11
          },
          "md": {
            "type": "px",
            "value": 11
          },
          "sm": {
            "type": "px",
            "value": 11
          },
          "xl": {
            "type": "px",
            "value": 11
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 20
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 20
          },
          "lg": {
            "type": "px",
            "value": 20
          },
          "md": {
            "type": "px",
            "value": 20
          },
          "sm": {
            "type": "px",
            "value": 20
          },
          "xl": {
            "type": "px",
            "value": 20
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "serif",
          "lg": "serif",
          "md": "sans",
          "sm": "sans",
          "xl": "serif"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 56
          },
          "lg": {
            "type": "px",
            "value": 40
          },
          "md": {
            "type": "px",
            "value": 32
          },
          "sm": {
            "type": "px",
            "value": 24
          },
          "xl": {
            "type": "px",
            "value": 48
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 500
          },
          "lg": {
            "type": "unitless",
            "value": 500
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 500
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 32
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 64
          },
          "lg": {
            "type": "px",
            "value": 48
          },
          "md": {
            "type": "px",
            "value": 40
          },
          "sm": {
            "type": "px",
            "value": 32
          },
          "xl": {
            "type": "px",
            "value": 56
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "serif",
          "lg": "serif",
          "md": "sans",
          "sm": "sans",
          "xl": "serif"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 56
          },
          "lg": {
            "type": "px",
            "value": 40
          },
          "md": {
            "type": "px",
            "value": 32
          },
          "sm": {
            "type": "px",
            "value": 24
          },
          "xl": {
            "type": "px",
            "value": 48
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 500
          },
          "lg": {
            "type": "unitless",
            "value": 500
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 500
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 32
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 64
          },
          "lg": {
            "type": "px",
            "value": 48
          },
          "md": {
            "type": "px",
            "value": 40
          },
          "sm": {
            "type": "px",
            "value": 32
          },
          "xl": {
            "type": "px",
            "value": 56
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title2": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 28
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 28
          },
          "lg": {
            "type": "px",
            "value": 28
          },
          "md": {
            "type": "px",
            "value": 28
          },
          "sm": {
            "type": "px",
            "value": 28
          },
          "xl": {
            "type": "px",
            "value": 28
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 30.8
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 30.8
          },
          "lg": {
            "type": "px",
            "value": 30.8
          },
          "md": {
            "type": "px",
            "value": 30.8
          },
          "sm": {
            "type": "px",
            "value": 30.8
          },
          "xl": {
            "type": "px",
            "value": 30.8
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title2/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 28
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 28
          },
          "lg": {
            "type": "px",
            "value": 28
          },
          "md": {
            "type": "px",
            "value": 28
          },
          "sm": {
            "type": "px",
            "value": 28
          },
          "xl": {
            "type": "px",
            "value": 28
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 30.8
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 30.8
          },
          "lg": {
            "type": "px",
            "value": 30.8
          },
          "md": {
            "type": "px",
            "value": 30.8
          },
          "sm": {
            "type": "px",
            "value": 30.8
          },
          "xl": {
            "type": "px",
            "value": 30.8
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title3": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 24
          },
          "lg": {
            "type": "px",
            "value": 36
          },
          "md": {
            "type": "px",
            "value": 32
          },
          "sm": {
            "type": "px",
            "value": 28
          },
          "xl": {
            "type": "px",
            "value": 36
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 28
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 30
          },
          "lg": {
            "type": "px",
            "value": 40
          },
          "md": {
            "type": "px",
            "value": 36
          },
          "sm": {
            "type": "px",
            "value": 32
          },
          "xl": {
            "type": "px",
            "value": 40
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title3/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 24
          },
          "lg": {
            "type": "px",
            "value": 36
          },
          "md": {
            "type": "px",
            "value": 32
          },
          "sm": {
            "type": "px",
            "value": 28
          },
          "xl": {
            "type": "px",
            "value": 36
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 28
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 30
          },
          "lg": {
            "type": "px",
            "value": 40
          },
          "md": {
            "type": "px",
            "value": 36
          },
          "sm": {
            "type": "px",
            "value": 32
          },
          "xl": {
            "type": "px",
            "value": 40
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title4": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 24
          },
          "lg": {
            "type": "px",
            "value": 24
          },
          "md": {
            "type": "px",
            "value": 24
          },
          "sm": {
            "type": "px",
            "value": 24
          },
          "xl": {
            "type": "px",
            "value": 24
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 26.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 26.4
          },
          "lg": {
            "type": "px",
            "value": 26.4
          },
          "md": {
            "type": "px",
            "value": 26.4
          },
          "sm": {
            "type": "px",
            "value": 26.4
          },
          "xl": {
            "type": "px",
            "value": 26.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "title4/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 24
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 24
          },
          "lg": {
            "type": "px",
            "value": 24
          },
          "md": {
            "type": "px",
            "value": 24
          },
          "sm": {
            "type": "px",
            "value": 24
          },
          "xl": {
            "type": "px",
            "value": 24
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 700
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 700
          },
          "lg": {
            "type": "unitless",
            "value": 700
          },
          "md": {
            "type": "unitless",
            "value": 700
          },
          "sm": {
            "type": "unitless",
            "value": 700
          },
          "xl": {
            "type": "unitless",
            "value": 700
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 26.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 26.4
          },
          "lg": {
            "type": "px",
            "value": 26.4
          },
          "md": {
            "type": "px",
            "value": 26.4
          },
          "sm": {
            "type": "px",
            "value": 26.4
          },
          "xl": {
            "type": "px",
            "value": 26.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui1": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui1/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui2": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui2/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 16
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 16
          },
          "lg": {
            "type": "px",
            "value": 16
          },
          "md": {
            "type": "px",
            "value": 16
          },
          "sm": {
            "type": "px",
            "value": 16
          },
          "xl": {
            "type": "px",
            "value": 16
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.6
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.6
          },
          "lg": {
            "type": "px",
            "value": 17.6
          },
          "md": {
            "type": "px",
            "value": 17.6
          },
          "sm": {
            "type": "px",
            "value": 17.6
          },
          "xl": {
            "type": "px",
            "value": 17.6
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui3": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15.4
          },
          "lg": {
            "type": "px",
            "value": 15.4
          },
          "md": {
            "type": "px",
            "value": 15.4
          },
          "sm": {
            "type": "px",
            "value": 15.4
          },
          "xl": {
            "type": "px",
            "value": 15.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui3/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 600
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 600
          },
          "lg": {
            "type": "unitless",
            "value": 600
          },
          "md": {
            "type": "unitless",
            "value": 600
          },
          "sm": {
            "type": "unitless",
            "value": 600
          },
          "xl": {
            "type": "unitless",
            "value": 600
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 15.4
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 15.4
          },
          "lg": {
            "type": "px",
            "value": 15.4
          },
          "md": {
            "type": "px",
            "value": 15.4
          },
          "sm": {
            "type": "px",
            "value": 15.4
          },
          "xl": {
            "type": "px",
            "value": 15.4
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui4": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui4/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui5": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui5/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui6": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    },
    "ui6/emphasized": {
      "fontFamily": {
        "base": "sans",
        "breakpoints": {
          "2xl": "sans",
          "lg": "sans",
          "md": "sans",
          "sm": "sans",
          "xl": "sans"
        }
      },
      "fontSize": {
        "base": {
          "type": "px",
          "value": 14
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 14
          },
          "lg": {
            "type": "px",
            "value": 14
          },
          "md": {
            "type": "px",
            "value": 14
          },
          "sm": {
            "type": "px",
            "value": 14
          },
          "xl": {
            "type": "px",
            "value": 14
          }
        }
      },
      "fontSlant": {
        "base": {
          "type": "unitless",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 0
          },
          "lg": {
            "type": "unitless",
            "value": 0
          },
          "md": {
            "type": "unitless",
            "value": 0
          },
          "sm": {
            "type": "unitless",
            "value": 0
          },
          "xl": {
            "type": "unitless",
            "value": 0
          }
        }
      },
      "fontWeight": {
        "base": {
          "type": "unitless",
          "value": 450
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 450
          },
          "lg": {
            "type": "unitless",
            "value": 450
          },
          "md": {
            "type": "unitless",
            "value": 450
          },
          "sm": {
            "type": "unitless",
            "value": 450
          },
          "xl": {
            "type": "unitless",
            "value": 450
          }
        }
      },
      "fontWidth": {
        "base": {
          "type": "unitless",
          "value": 75
        },
        "breakpoints": {
          "2xl": {
            "type": "unitless",
            "value": 75
          },
          "lg": {
            "type": "unitless",
            "value": 75
          },
          "md": {
            "type": "unitless",
            "value": 75
          },
          "sm": {
            "type": "unitless",
            "value": 75
          },
          "xl": {
            "type": "unitless",
            "value": 75
          }
        }
      },
      "letterSpacing": {
        "base": {
          "type": "px",
          "value": 0
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 0
          },
          "lg": {
            "type": "px",
            "value": 0
          },
          "md": {
            "type": "px",
            "value": 0
          },
          "sm": {
            "type": "px",
            "value": 0
          },
          "xl": {
            "type": "px",
            "value": 0
          }
        }
      },
      "lineHeight": {
        "base": {
          "type": "px",
          "value": 17.5
        },
        "breakpoints": {
          "2xl": {
            "type": "px",
            "value": 17.5
          },
          "lg": {
            "type": "px",
            "value": 17.5
          },
          "md": {
            "type": "px",
            "value": 17.5
          },
          "sm": {
            "type": "px",
            "value": 17.5
          },
          "xl": {
            "type": "px",
            "value": 17.5
          }
        }
      },
      "textTransform": {
        "base": "none",
        "breakpoints": {
          "2xl": "none",
          "lg": "none",
          "md": "none",
          "sm": "none",
          "xl": "none"
        }
      }
    }
  },
  "version": "v0.72.0"
};
