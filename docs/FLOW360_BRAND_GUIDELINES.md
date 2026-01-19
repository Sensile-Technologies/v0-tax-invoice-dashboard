# Flow360 Brand Guidelines

## Brand Identity

### Brand Name
- **Full Name**: Flow360™
- **Usage**: Always include the trademark symbol (™) on first mention
- **Tagline**: Business Management Dashboard

### Company Attribution
- **Developed by**: Sensile Technologies East Africa Ltd
- **Footer Text**: "Powered by Sensile Technologies East Africa Ltd"

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | OKLCH Value | Usage |
|------------|----------|-------------|-------|
| **Primary Blue** | #2563eb | oklch(0.48 0.18 252) | Main brand color, buttons, links |
| **Primary Blue Light** | #3b82f6 | oklch(0.58 0.18 252) | Hover states, accents |
| **Navy Dark** | #1e3a5c | oklch(0.23 0.01 254) | Text, headings |

### Secondary Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Slate 900** | #0f172a | Gradient start, dark backgrounds |
| **Blue 900** | #1e3a8a | Gradient mid, chart color |
| **White** | #ffffff | Backgrounds, cards |
| **Slate 50** | #f8fafc | Page backgrounds |

### Semantic Colors

| Purpose | Hex Code | Usage |
|---------|----------|-------|
| **Success** | #22c55e | Positive actions, active status |
| **Warning** | #f59e0b | Alerts, pending status |
| **Amber** | #d97706 | KRA intermittency, cautions |
| **Destructive** | #ef4444 | Errors, delete actions, voided |
| **Info** | #3b82f6 | Information, links |

### Chart Colors

| Variable | Hex Code | Purpose |
|----------|----------|---------|
| Chart 1 | #1e3a8a | Primary data series |
| Chart 2 | #ff6b6b | Secondary/comparison |
| Chart 3 | #2563eb | Tertiary data |
| Chart 4 | #ffa07a | Highlight/accent |
| Chart 5 | #3b82f6 | Additional series |

---

## Typography

### Font Family
- **Primary**: System sans-serif stack
- **Fallback**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Font Sizes

| Element | Size | Weight |
|---------|------|--------|
| Page Title | 2xl-3xl (1.5-1.875rem) | Bold (700) |
| Card Title | lg (1.125rem) | Bold (700) |
| Body Text | sm-base (0.875-1rem) | Normal (400) |
| Labels | xs-sm (0.75-0.875rem) | Medium (500) |
| Muted Text | xs (0.75rem) | Normal (400) |

---

## UI Components

### Border Radius
- **Default**: 0.75rem (12px) - `rounded-xl`
- **Cards**: 1rem (16px) - `rounded-2xl`
- **Buttons**: 0.75rem (12px) - `rounded-xl`
- **Inputs**: 0.75rem (12px) - `rounded-xl`
- **Full Round**: 9999px - `rounded-full` (for avatars, badges)

### Shadows
- **Card Shadow**: `shadow-lg` for elevated cards
- **Header Shadow**: `shadow-2xl` for main container
- **Subtle**: `shadow-sm` for hover states

### Spacing
- **Page Padding**: 1.5rem (24px) on large screens
- **Card Padding**: 1rem-1.5rem (16-24px)
- **Component Gap**: 1rem (16px) between elements

---

## Layout Patterns

### Page Background Gradient
```css
background: linear-gradient(to bottom, 
  #0f172a,   /* slate-900 */
  #1e3a8a,   /* blue-900 */
  #ffffff    /* white */
);
```

### Sidebar
- **Background**: Primary Blue (#2563eb)
- **Text**: White
- **Active State**: Lighter blue with white text
- **Width**: 256px expanded, 64px collapsed

### Cards
- **Background**: White
- **Border**: Subtle slate border
- **Shadow**: lg shadow for depth
- **Corners**: Rounded 2xl (16px)

---

## Status Indicators

### Badge Colors

| Status | Background | Text |
|--------|------------|------|
| Active | bg-green-100 | text-green-800 |
| Inactive | bg-slate-100 | text-slate-600 |
| Pending | bg-amber-100 | text-amber-800 |
| Transmitted | bg-green-100 | text-green-800 |
| Failed | bg-red-100 | text-red-800 |

### Fuel Type Colors
Each fuel type can have a custom `color_code` stored in the `items` table for chart visualization consistency.

---

## Icons

### Icon Library
- **Primary**: Lucide React icons
- **Size**: h-4 w-4 (16px) for inline, h-5 w-5 (20px) for buttons

### Common Icons

| Purpose | Icon |
|---------|------|
| Dashboard | LayoutDashboard |
| Sales | ShoppingCart |
| Inventory | Package |
| Reports | BarChart3 |
| Settings | Settings |
| Add | Plus |
| Edit | Edit / Pencil |
| Delete | Trash2 |
| Refresh | RefreshCw |
| Download | Download |
| Print | Printer |

---

## Logo Usage

### Primary Logo
- Display "Flow360" with superscript "™"
- Use primary blue on light backgrounds
- Use white on dark backgrounds

### Minimum Size
- Width: 120px minimum for legibility

### Clear Space
- Maintain padding equal to the height of the "3" character around the logo

---

## Print Styles

### Print Considerations
- Remove shadows and gradients
- Use black text on white background
- Hide navigation elements
- Include page headers with branch/company name
- Add footer with generation timestamp

---

## Accessibility

### Color Contrast
- All text meets WCAG 2.1 AA contrast requirements
- Primary blue on white: 4.5:1 ratio minimum
- Dark text on light backgrounds: 7:1+ ratio

### Focus States
- Visible focus rings using `ring` utility
- Ring color matches primary blue

---

## Mobile Considerations

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Mobile-First
- Collapsible sidebar on mobile
- Stack horizontal layouts vertically
- Full-width cards and buttons on small screens

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial brand guidelines |
