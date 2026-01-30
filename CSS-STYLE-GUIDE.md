# Washington Artisan Marketplace - CSS Style Guide

## Overview
This guide ensures consistent styling across all pages.

## CSS Load Order
1. design-system.css
2. icons.css
3. main.css
4. Page-specific CSS

## Spacing - Use Variables
- --space-1 (4px) to --space-8 (32px)
- Never hardcode pixels

## Colors - Use Variables
- Primary: --primary-50 to --primary-900
- Grays: --gray-50 to --gray-900
- Semantic: --success, --error, --warning, --info

## Icon Standards
Always style both states:
```css
.component i[data-lucide],
.component svg.lucide {
  width: 20px;
  height: 20px;
  min-width: 20px;
  flex-shrink: 0;
}
```

## Header Alignment Fix
```css
h1, h2, h3 {
  margin: 0;
  padding: 0;
  line-height: 1.2;
}
```

## Dropdown Arrow Fix
```css
.form-select {
  padding-right: calc(var(--space-4) + 24px);
}
```
