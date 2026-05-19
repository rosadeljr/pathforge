# PathForge Component Library

Complete documentation of reusable components in the PathForge design system.

---

## UI Components (`components/ui/`)

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">Click me</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'tertiary' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: `boolean` - Shows loading spinner
- `icon`: `ReactNode` - Optional icon

---

### Card

Premium card component with glassmorphism effect.

```tsx
import { Card } from '@/components/ui/Card';

<Card glass hover interactive>
  Content here
</Card>
```

**Props:**
- `glass`: `boolean` - Glassmorphic background (default: true)
- `hover`: `boolean` - Border/shadow hover effect
- `interactive`: `boolean` - Lift on hover

---

### Input

Enhanced form input with validation and icon support.

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="example@email.com"
  error="Invalid email"
/>
```

**Props:**
- `label`: `string` - Input label
- `error`: `string` - Error message
- `icon`: `ReactNode` - Icon element
- All standard HTML input attributes

---

### Badge

Status badges with multiple color variants.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="emerald">Success</Badge>
```

**Variants:** `cyan | violet | amber | emerald | rose | slate`

**Sizes:** `sm | md`

---

### Progress

Animated progress bar with gradient fill.

```tsx
import { Progress } from '@/components/ui/Progress';

<Progress value={75} max={100} color="cyan" showLabel />
```

**Props:**
- `value`: `number` - Current progress
- `max`: `number` - Maximum value
- `color`: `'cyan' | 'violet' | 'amber' | 'emerald'`
- `showLabel`: `boolean` - Display percentage

---

### Stat

Stat display component with trend indicators.

```tsx
import { Stat } from '@/components/ui/Stat';

<Stat
  label="Current Level"
  value={15}
  icon={<Trophy />}
  trend="up"
/>
```

**Props:**
- `label`: `string` - Stat label
- `value`: `string | number` - Stat value
- `icon`: `ReactNode` - Icon element
- `color`: `'cyan' | 'violet' | 'amber'`
- `trend`: `'up' | 'down'` - Trend indicator

---

### Modal

Animated dialog with backdrop blur and keyboard support.

```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  Modal content
</Modal>
```

**Props:**
- `isOpen`: `boolean` - Open/close state
- `onClose`: `() => void` - Close handler
- `title`: `ReactNode` - Modal title
- `footer`: `ReactNode` - Footer content
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `closeButton`: `boolean` - Show close button (default: true)

---

### Dropdown

Searchable dropdown with multi-select support.

```tsx
import { Dropdown } from '@/components/ui/Dropdown';

const options = [
  { value: 'opt1', label: 'Option 1', icon: <Icon /> },
  { value: 'opt2', label: 'Option 2' },
];

<Dropdown
  options={options}
  value={selected}
  onChange={setSelected}
  searchable
  multi
/>
```

**Props:**
- `options`: `DropdownOption[]` - Options array
- `value`: `string | number` - Selected value
- `onChange`: `(value) => void` - Change handler
- `placeholder`: `string` - Placeholder text
- `searchable`: `boolean` - Enable search
- `multi`: `boolean` - Multi-select mode

---

### Tabs

Animated tab component with icon support.

```tsx
import { Tabs } from '@/components/ui/Tabs';

const tabs = [
  { id: 'tab1', label: 'Tab 1', icon: <Icon />, content: <div /> },
  { id: 'tab2', label: 'Tab 2', content: <div /> },
];

<Tabs
  tabs={tabs}
  defaultTabId="tab1"
  variant="default"
/>
```

**Props:**
- `tabs`: `TabItem[]` - Tab items
- `defaultTabId`: `string` - Default active tab
- `onChange`: `(tabId) => void` - Change handler
- `variant`: `'default' | 'outline' | 'soft'`

---

### Accordion

Smooth expand/collapse component with single/multiple modes.

```tsx
import { Accordion } from '@/components/ui/Accordion';

const items = [
  { id: 'item1', title: 'Title 1', content: <div />, icon: <Icon /> },
  { id: 'item2', title: 'Title 2', content: <div /> },
];

<Accordion items={items} type="single" />
```

**Props:**
- `items`: `AccordionItem[]` - Accordion items
- `type`: `'single' | 'multiple'` - Expand mode

---

### Toast

Toast notification component with styled wrapper.

```tsx
import { showToast } from '@/components/ui/Toast';

showToast.success('Action completed!');
showToast.error('Something went wrong');
showToast.info('Information');
showToast.warning('Be careful!');
```

**Methods:**
- `showToast.success(message, options)`
- `showToast.error(message, options)`
- `showToast.info(message, options)`
- `showToast.warning(message, options)`
- `showToast.loading(message)`
- `showToast.dismiss(toastId?)`

---

### Skeleton

Animated skeleton loader for loading states.

```tsx
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton';

// Basic skeleton
<Skeleton width="100%" height="1rem" />

// Preset skeletons
<SkeletonCard />
<SkeletonList count={3} />
```

**Props:**
- `width`: `string | number` - Skeleton width
- `height`: `string | number` - Skeleton height
- `shape`: `'rect' | 'circle' | 'rounded'` - Shape type
- `count`: `number` - Number of skeletons
- `animated`: `boolean` - Enable pulse animation

**Presets:**
- `SkeletonCard()` - Card placeholder
- `SkeletonText(lines)` - Text lines
- `SkeletonAvatar()` - Avatar circle
- `SkeletonList(count)` - List items
- `SkeletonGrid(columns, count)` - Grid layout

---

### Tooltip

Hover/click-triggered tooltip with smart positioning.

```tsx
import { Tooltip } from '@/components/ui/Tooltip';

<Tooltip content="Help text" position="top" delay={200}>
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content`: `ReactNode` - Tooltip content
- `position`: `'top' | 'bottom' | 'left' | 'right' | ...`
- `delay`: `number` - Delay in ms (default: 200)

---

### Popover

Click/hover-triggered popover with auto-close.

```tsx
import { Popover } from '@/components/ui/Popover';

<Popover
  content={<div>Menu content</div>}
  trigger="click"
  position="bottom"
>
  <button>Click me</button>
</Popover>
```

**Props:**
- `content`: `ReactNode` - Popover content
- `trigger`: `'click' | 'hover'`
- `position`: `'top' | 'bottom' | 'left' | 'right'`

---

### Avatar

User avatar with fallback initials and status indicator.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';

<Avatar
  src="/avatar.jpg"
  alt="User Name"
  initials="UN"
  size="md"
  status="online"
/>

// Avatar group
<AvatarGroup
  avatars={[{ src: '...' }, { initials: 'JD' }]}
  max={3}
/>
```

**Props:**
- `src`: `string` - Avatar image URL
- `alt`: `string` - Image alt text
- `initials`: `string` - Fallback initials
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`
- `status`: `'online' | 'offline' | 'away' | 'busy'`
- `badge`: `ReactNode` - Badge overlay

---

### EmptyState

Flexible empty state component with icon and CTA.

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  icon="🎯"
  title="No Items"
  description="Create your first item to get started"
  action={{ label: 'Create', onClick: () => {} }}
/>
```

**Props:**
- `icon`: `ReactNode` - Icon or emoji
- `title`: `string` - Title text
- `description`: `string` - Description text
- `action`: `{ label, onClick }` - CTA button
- `illustration`: `ReactNode` - Custom illustration

---

## Form Components (`components/forms/`)

### FormField

Complete form field with label, input, error, and hint.

```tsx
import { FormField } from '@/components/forms/FormField';

<FormField
  label="Email"
  type="email"
  placeholder="example@email.com"
  error="Invalid email"
  hint="We'll never share your email"
  required
  icon={<Mail />}
/>
```

**Props:**
- All `FormLabel`, `FormInput`, `FormError`, `FormHint` props combined
- `label`: `string` - Field label
- `error`: `string` - Error message
- `hint`: `string` - Helper text
- `required`: `boolean` - Show required indicator
- `icon`: `ReactNode` - Input icon
- `iconPosition`: `'left' | 'right'`

---

### FormLabel

Label with optional required indicator.

```tsx
import { FormLabel } from '@/components/forms/FormLabel';

<FormLabel htmlFor="email" required>
  Email Address
</FormLabel>
```

---

### FormError

Animated error message with icon.

```tsx
import { FormError } from '@/components/forms/FormError';

<FormError>Email is required</FormError>
```

---

### FormHint

Helper text below input.

```tsx
import { FormHint } from '@/components/forms/FormHint';

<FormHint>Minimum 8 characters</FormHint>
```

---

### FormGroup

Grouped form fields with border.

```tsx
import { FormGroup } from '@/components/forms/FormGroup';

<FormGroup title="Personal Info" description="Your details">
  <FormField label="Name" />
  <FormField label="Email" />
</FormGroup>
```

---

## Empty State Components (`components/empty-states/`)

Pre-built empty state components for common scenarios.

### EmptyQuests

```tsx
import { EmptyQuests } from '@/components/empty-states/EmptyQuests';

<EmptyQuests onCreateQuest={() => {}} />
```

### EmptyProjects

```tsx
import { EmptyProjects } from '@/components/empty-states/EmptyProjects';

<EmptyProjects onAddProject={() => {}} />
```

### EmptyAchievements

```tsx
import { EmptyAchievements } from '@/components/empty-states/EmptyAchievements';

<EmptyAchievements />
```

### EmptyMessages

```tsx
import { EmptyMessages } from '@/components/empty-states/EmptyMessages';

<EmptyMessages onStartChat={() => {}} />
```

### EmptyStreaks

```tsx
import { EmptyStreaks } from '@/components/empty-states/EmptyStreaks';

<EmptyStreaks onStartQuest={() => {}} />
```

### EmptySearch

```tsx
import { EmptySearch } from '@/components/empty-states/EmptySearch';

<EmptySearch query="search term" onClear={() => {}} />
```

---

## Skeleton Components (`components/skeletons/`)

Full-page skeleton loading screens.

### DashboardSkeleton

Dashboard layout placeholder during data loading.

```tsx
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

<DashboardSkeleton />
```

### QuestListSkeleton

Quest grid loading state.

```tsx
import { QuestListSkeleton } from '@/components/skeletons/QuestListSkeleton';

<QuestListSkeleton />
```

### MentorChatSkeleton

Chat interface loading state.

```tsx
import { MentorChatSkeleton } from '@/components/skeletons/MentorChatSkeleton';

<MentorChatSkeleton />
```

### PortfolioSkeleton

Portfolio grid loading state.

```tsx
import { PortfolioSkeleton } from '@/components/skeletons/PortfolioSkeleton';

<PortfolioSkeleton />
```

---

## Dialog Components (`components/dialogs/`)

### ConfirmationDialog

Modal for confirming destructive actions.

```tsx
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

<ConfirmationDialog
  isOpen={showConfirm}
  title="Delete Project?"
  description="This action cannot be undone. Your project will be permanently deleted."
  level="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

**Props:**
- `isOpen`: `boolean` - Open/close state
- `title`: `string` - Dialog title
- `description`: `ReactNode` - Dialog description
- `confirmLabel`: `string` - Confirm button text
- `cancelLabel`: `string` - Cancel button text
- `level`: `'info' | 'warning' | 'danger'`
- `onConfirm`: `() => void` - Confirm handler
- `onCancel`: `() => void` - Cancel handler
- `isLoading`: `boolean` - Loading state

---

## Layout Components (`components/layout/`)

### Container

Responsive container with max-width and padding.

```tsx
import { Container } from '@/components/layout/Container';

<Container maxWidth="2xl" padding>
  Content
</Container>
```

**Props:**
- `maxWidth`: `'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'`
- `padding`: `boolean` - Add padding

---

### Section

Page section with background variants.

```tsx
import { Section } from '@/components/layout/Section';

<Section background="gradient" padding="lg">
  Section content
</Section>
```

---

## Best Practices

### 1. Component Composition

Always use components instead of raw HTML:

```tsx
// ✅ Good
<FormField label="Email" type="email" />

// ❌ Avoid
<input type="email" placeholder="Email" />
```

### 2. Error Handling

Use FormError for validation:

```tsx
const [errors, setErrors] = useState({});

<FormField
  label="Email"
  error={errors.email}
  onChange={(e) => {
    if (!isValidEmail(e.target.value)) {
      setErrors({ email: 'Invalid email' });
    }
  }}
/>
```

### 3. Loading States

Use skeleton components while loading:

```tsx
{loading ? <SkeletonCard /> : <Card>Content</Card>}
```

### 4. Empty States

Show empty states when no data:

```tsx
{quests.length === 0 ? (
  <EmptyQuests onCreateQuest={handleCreate} />
) : (
  <QuestList quests={quests} />
)}
```

### 5. Animations

Use Framer Motion for complex animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Accessibility

All components are built with accessibility in mind:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast (WCAG AA)
- Screen reader support

---

## Design Tokens

Reference design tokens in `tailwind.config.ts`:

- **Colors**: Cyan, Violet, Amber, Emerald, Rose
- **Spacing**: 4px base unit (3.5, 4.5, 5.5, etc.)
- **Border Radius**: 2px to 2rem (rounded, rounded-2xl, etc.)
- **Shadows**: sm to 2xl with color tints
- **Animations**: Fast (150ms), Base (250ms), Slow (350ms)

---

*Last Updated: May 19, 2026*
