# PathForge - Design System

Complete design tokens, component library, and styling guidelines.

---

## Color Palette

### Primary Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Cyan 300 | #4dd9f1 | 77, 217, 241 | Hover states |
| **Cyan 400** | #22d3ee | 34, 211, 238 | Primary accent |
| **Cyan 500** | #06b6d4 | 6, 182, 212 | Primary brand |
| Cyan 600 | #0891b2 | 8, 145, 178 | Dark accent |

### Secondary Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Violet 400 | #c084fc | 192, 132, 252 | Highlight |
| **Violet 500** | #a855f7 | 168, 85, 247 | Secondary brand |
| **Violet 600** | #9333ea | 147, 51, 234 | Dark secondary |
| Violet 700 | #7e22ce | 126, 34, 206 | Darkest |

### Accent Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Amber 300 | #fcd34d | 252, 211, 77 | Tertiary accent |
| **Amber 400** | #fbbf24 | 251, 191, 36 | Accent |
| Amber 500 | #f59e0b | 245, 158, 11 | Dark accent |
| Amber 600 | #d97706 | 217, 119, 6 | Darkest accent |

### Neutral Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Black | #000000 | 0, 0, 0 | Background |
| Charcoal 900 | #0a0a0a | 10, 10, 10 | Surface |
| **Charcoal 800** | #1a1a1a | 26, 26, 26 | Cards |
| **Charcoal 700** | #2d2d2d | 45, 45, 45 | Hover |
| Slate 700 | #2d3748 | 45, 55, 72 | Borders |
| Slate 400 | #94a3b8 | 148, 163, 184 | Muted text |

### Semantic Colors
| Usage | Color | Hex |
|-------|-------|-----|
| Success | Emerald 500 | #10b981 |
| Warning | Amber 500 | #f59e0b |
| Error | Rose 500 | #f43f5e |
| Info | Cyan 500 | #06b6d4 |

---

## Typography

### Font Family
```css
--font-sans: "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "Geist Mono", monospace;
```

### Type Scale

| Size | px | Class | Usage |
|------|----|---------|-|
| XS | 12px | `text-xs` | Captions, badges |
| SM | 14px | `text-sm` | Labels, small text |
| BASE | 16px | `text-base` | Body text |
| LG | 18px | `text-lg` | Larger body |
| XL | 20px | `text-xl` | Small headings |
| 2XL | 24px | `text-2xl` | Subheadings |
| 3XL | 30px | `text-3xl` | Section titles |
| 4XL | 36px | `text-4xl` | Page titles |
| 5XL | 48px | `text-5xl` | Hero headlines |
| 6XL | 60px | `text-6xl` | Large hero |
| 7XL | 72px | `text-7xl` | Mega hero |

### Font Weights

| Weight | Value | Class | Usage |
|--------|-------|-------|-------|
| Light | 300 | `font-light` | Subtle text |
| Normal | 400 | `font-normal` | Body copy |
| Medium | 500 | `font-medium` | Labels |
| Semibold | 600 | `font-semibold` | Headings |
| Bold | 700 | `font-bold` | Strong emphasis |

### Line Height
```css
xs: 1rem        /* 12px */
sm: 1.25rem     /* 14px */
base: 1.5rem    /* 16px */
lg: 1.75rem     /* 18px */
xl: 1.75rem     /* 20px */
2xl: 2rem       /* 24px */
3xl: 2.25rem    /* 30px */
```

### Letter Spacing
```css
normal: 0
tight: -0.02em
snug: -0.015em
```

---

## Spacing

### Scale (4px base unit)

| Name | px | Class | Usage |
|------|-------|-------|-----|
| 0.5 | 2px | `p-0.5` | Minimal |
| 1 | 4px | `p-1` | Tight |
| 2 | 8px | `p-2` | Compact |
| 3 | 12px | `p-3` | Normal |
| 4 | 16px | `p-4` | Standard |
| 5 | 20px | `p-5` | Medium |
| 6 | 24px | `p-6` | Generous |
| 8 | 32px | `p-8` | Large |
| 10 | 40px | `p-10` | XL |
| 12 | 48px | `p-12` | 2XL |
| 16 | 64px | `p-16` | 3XL |
| 20 | 80px | `p-20` | 4XL |

### Half-Steps (Tailwind extending)
| Name | px | Class |
|------|----|-------|
| 3.5 | 14px | `p-3.5` |
| 4.5 | 18px | `p-4.5` |
| 5.5 | 22px | `p-5.5` |
| 6.5 | 26px | `p-6.5` |
| 7.5 | 30px | `p-7.5` |

---

## Border Radius

### Scale
| Name | px | Class | Usage |
|------|-------|--------|-------|
| None | 0 | `rounded-none` | Sharp |
| SM | 2px | `rounded-sm` | Minimal |
| Base | 4px | `rounded` | Default |
| MD | 6px | `rounded-md` | Buttons |
| LG | 8px | `rounded-lg` | Cards |
| XL | 12px | `rounded-xl` | Large cards |
| **2XL** | 16px | `rounded-2xl` | Premium |
| **3XL** | 24px | `rounded-3xl` | Large sections |
| **4XL** | 32px | `rounded-4xl` | Oversized |
| FULL | 9999px | `rounded-full` | Circles |

### Component Defaults
- Buttons: `rounded-lg`
- Cards: `rounded-2xl`
- Inputs: `rounded-lg`
- Modals: `rounded-2xl`
- Large containers: `rounded-3xl`

---

## Shadow System

### Elevation Levels
```css
shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05)

shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px 0 rgba(0, 0, 0, 0.06)

shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06)

shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05)

shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04)

shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Glow Effects
```css
shadow-glow-cyan:   0 0 20px rgba(6, 182, 212, 0.4),
                    0 0 40px rgba(6, 182, 212, 0.2)

shadow-glow-violet: 0 0 20px rgba(168, 85, 247, 0.4),
                    0 0 40px rgba(168, 85, 247, 0.2)
```

---

## Animations

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Keyframe Animations

#### Float
```css
animation: float 6s ease-in-out infinite
/* 0%: translateY(0)
   50%: translateY(-20px)
   100%: translateY(0) */
```

#### Shimmer
```css
animation: shimmer 2s linear infinite
/* Creates shimmering effect for loading states */
```

#### Slide In
```css
animation: slideInRight 0.5s ease-out
animation: slideInLeft 0.5s ease-out
animation: slideInUp 0.5s ease-out
```

#### Fade In
```css
animation: fadeIn 0.5s ease-out
/* 0%: opacity(0)
   100%: opacity(1) */
```

#### Scale In
```css
animation: scaleIn 0.3s ease-out
/* 0%: scale(0.95), opacity(0)
   100%: scale(1), opacity(1) */
```

### Component Animations
- **Button hover**: Lift + scale
- **Card hover**: Border glow + shadow
- **Input focus**: Border color + background
- **Loading**: Shimmer + pulse-slow
- **Page entrance**: Fade-in + slide-up

---

## Component Library

### Button

```typescript
<Button
  variant="primary" | "secondary" | "tertiary" | "ghost"
  size="sm" | "md" | "lg"
  loading={boolean}
  icon={ReactNode}
>
  Click me
</Button>
```

**Variants:**
- `primary`: Gradient cyan-to-violet, hover glow
- `secondary`: Bordered cyan, transparent bg
- `tertiary`: Text only, subtle hover
- `ghost`: Minimal, hover background

### Card

```typescript
<Card
  glass={true}
  hover={true}
  interactive={false}
  className="custom-class"
>
  Content
</Card>
```

**Props:**
- `glass`: Glassmorphic effect (default: true)
- `hover`: Border/shadow hover effect
- `interactive`: Lift on hover

### Input

```typescript
<Input
  label="Email"
  error="Error message"
  icon={<IconComponent />}
  type="email"
  placeholder="example@email.com"
/>
```

### Progress

```typescript
<Progress
  value={75}
  max={100}
  color="cyan" | "violet" | "amber" | "emerald"
  showLabel={true}
  size="sm" | "md" | "lg"
/>
```

### Badge

```typescript
<Badge
  variant="cyan" | "violet" | "amber" | "emerald" | "rose" | "slate"
  size="sm" | "md"
>
  Label
</Badge>
```

### Stat

```typescript
<Stat
  label="Current Level"
  value={15}
  icon={<TrophyIcon />}
  color="cyan" | "violet" | "amber"
  trend="up" | "down"
/>
```

---

## Layout Components

### Container

```typescript
<Container
  maxWidth="sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding={true}
>
  Content
</Container>
```

### Section

```typescript
<Section
  background="dark" | "gradient" | "glass"
  padding="sm" | "md" | "lg" | "xl"
  id="section-id"
>
  Content
</Section>
```

---

## Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Usage
```html
<!-- Mobile first -->
<div class="text-sm md:text-base lg:text-lg">
  Text size adapts
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Columns adapt
</div>
```

---

## Accessibility

### Color Contrast
- All text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States
```css
:focus-visible {
  outline: none;
  ring: 2px ring-cyan-500;
  ring-offset: 2px ring-offset-black;
}
```

### Keyboard Navigation
- Tab order logical
- Skip links for main content
- Arrow keys for menus
- Enter/Space for activation

### Screen Reader
- Semantic HTML (`<button>`, `<nav>`, etc.)
- ARIA labels where needed
- Alt text for images
- Heading hierarchy

---

## Dark Mode

All components support dark mode via `dark:` class prefix.

```html
<!-- Default light, dark with dark: prefix -->
<div class="bg-white dark:bg-black">
  Content
</div>
```

Since PathForge is dark-only, all components use dark colors by default.

---

## Utility Classes

### Custom Utilities

```css
.gradient-text {
  background: linear-gradient(...);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hover-lift {
  transition: all 250ms ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: large;
}
```

---

## Iconography

### Icon Library: Lucide React

```typescript
import {
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  // ... 30+ more icons
} from "lucide-react"
```

### Icon Sizes
- `size={16}` - Small (inline)
- `size={20}` - Default
- `size={24}` - Medium
- `size={32}` - Large
- `size={48}` - Extra large

### Icon Colors
```html
<Icon className="text-cyan-400" />
<Icon className="text-violet-400" />
<Icon className="text-amber-400" />
```

---

## Best Practices

### 1. Use Component Library
Always use components instead of raw HTML:
```typescript
// ✅ Good
<Button variant="primary">Click</Button>

// ❌ Avoid
<button className="...">Click</button>
```

### 2. Responsive First
Design mobile-first, enhance for desktop:
```html
<!-- ✅ Good -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- ❌ Avoid -->
<div class="grid grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
```

### 3. Color Consistency
Use semantic colors:
```typescript
// ✅ Good
<Badge variant="emerald">Success</Badge>
<Badge variant="rose">Error</Badge>

// ❌ Avoid
<Badge className="bg-green-500">Success</Badge>
```

### 4. Spacing Scale
Use consistent spacing:
```html
<!-- ✅ Good -->
<div class="p-6 gap-4 mb-8">

<!-- ❌ Avoid -->
<div style="padding: 24px; margin-bottom: 30px">
```

---

## Design Tokens Reference

```json
{
  "colors": {
    "primary": "#06b6d4",
    "secondary": "#a855f7",
    "accent": "#f59e0b",
    "success": "#10b981",
    "error": "#f43f5e",
    "warning": "#f59e0b"
  },
  "typography": {
    "fontFamily": "Geist Sans",
    "sizes": [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72],
    "weights": [300, 400, 500, 600, 700]
  },
  "spacing": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
  "radii": [2, 4, 6, 8, 12, 16, 24, 32, 9999],
  "shadows": ["sm", "base", "md", "lg", "xl", "2xl"],
  "animations": {
    "fast": "150ms",
    "base": "250ms",
    "slow": "350ms"
  }
}
```

---

*Last Updated: May 19, 2026*
