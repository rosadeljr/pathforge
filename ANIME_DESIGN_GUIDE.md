# PathForge Anime Design System 🔥⚡

**Aesthetic Inspiration:** Solo Leveling + Demon Slayer + Epic Progression

Transform career progression into an epic anime adventure with dramatic visuals, power level systems, and intense animations.

---

## 🎬 Anime Components

### PowerLevel Component

Display user power level in Solo Leveling style with dramatic rank badges and glowing effects.

```tsx
import { PowerLevel } from '@/components/anime/PowerLevel';

<PowerLevel
  level={25}
  maxLevel={100}
  rank="A"
  xp={5000}
  maxXp={10000}
  title="Your Combat Power"
/>
```

**Features:**
- **8-Rank System**: E → D → C → B → A → S → SS → SSS
- **Animated Rank Badge**: Pulsing glow with floating animation
- **Dual Progress Bars**: Level and XP with glowing fills
- **Power Stats**: Combat Power, Growth Rate, Potential
- **Dramatic Gradients**: Color-coded by rank rarity

**Rank Colors:**
- **E** - Slate (Weakest)
- **D** - Emerald
- **C** - Blue
- **B** - Purple
- **A** - Orange
- **S** - Rose
- **SS** - Gold/Yellow
- **SSS** - Cyan/Violet (Legendary)

---

### RankingTier Component

Demon Slayer-inspired tier progression system with breathing technique aesthetic.

```tsx
import { RankingTier } from '@/components/anime/RankingTier';

<RankingTier
  data={{
    currentRank: 3,
    nextRank: 4,
    title: 'Warrior',
    nextTitle: 'Swordmaster',
    progress: 65,
    special: 'Unlock: Advanced Sword Technique'
  }}
/>
```

**Features:**
- **6-Tier Progression**: Novice → Swordmaster → Legendary → Transcendent
- **Visual Tier Path**: Shows all tiers with progress
- **Special Abilities**: Unlock new powers at each tier
- **Animated Transitions**: Smooth progression effects
- **Breathing Indicator**: Like Demon Slayer's breathing styles

**Tiers:**
1. 🔱 Novice Slayer (Slate)
2. 🔱 Apprentice (Blue)
3. ⚡ Warrior (Cyan)
4. ⭐ Swordmaster (Purple)
5. ✨ Legendary (Rose)
6. 👑 Transcendent (Gold)

---

### AnimeQuestCard Component

Epic quest cards with element types and dramatic difficulty ratings.

```tsx
import { AnimeQuestCard } from '@/components/anime/AnimeQuestCard';

<AnimeQuestCard
  title="Defeat the Ice Golem"
  description="A powerful frost creature terrorizes the north. Defeat it to prove your strength."
  difficulty="B"
  xpReward={2500}
  status="active"
  progress={45}
  element="ice"
  icon="❄️"
/>
```

**Features:**
- **8-Tier Difficulty**: E (Easiest) → SSS (Hardest)
- **Element System**: Fire 🔥, Ice ❄️, Lightning ⚡, Earth 🌍
- **Status Tracking**: Active, Completed, Locked
- **Progress Bars**: Animated gradient fills with glow
- **Dynamic Difficulty Badges**: Color-coded with pulsing glow
- **Quest Icons**: Customizable emoji/icon for quest type

**Difficulty Indicators:**
```
E - Gray (Trivial)
D - Green (Easy)
C - Blue (Normal)
B - Purple (Hard)
A - Orange (Very Hard)
S - Red (Insane)
SS - Gold (Extreme)
SSS - Cyan (Legendary)
```

---

### AnimeAchievementCard Component

Epic achievement cards with rarity tiers and visual unlock effects.

```tsx
import { AnimeAchievementCard } from '@/components/anime/AnimeAchievementCard';

<AnimeAchievementCard
  title="First Strike"
  description="Complete your first quest"
  icon="⚔️"
  rarity="common"
  unlocked={true}
  unlockedAt="May 19, 2026"
  special="Unlock: +5% XP Boost"
/>
```

**Features:**
- **5 Rarity Tiers**: Common → Rare → Epic → Legendary → Mythic
- **Lock Animations**: Dramatic unlock effects
- **Star Ratings**: Visual rarity indicator
- **Special Bonuses**: Unlock power-ups from achievements
- **Glow Effects**: Intensity increases with rarity
- **Hover Animations**: 3D flip and scale effects

**Rarity Colors:**
```
Common - Slate
Rare - Cyan
Epic - Purple
Legendary - Rose
Mythic - Gold/Yellow
```

---

### LevelUpAnimation Component

Full-screen dramatic level-up celebration animation.

```tsx
import { LevelUpAnimation } from '@/components/anime/LevelUpAnimation';
import { useState } from 'react';

export function MyComponent() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(25);

  return (
    <>
      <LevelUpAnimation
        isVisible={showLevelUp}
        newLevel={newLevel}
        onComplete={() => setShowLevelUp(false)}
      />
      <button onClick={() => {
        setNewLevel(prev => prev + 1);
        setShowLevelUp(true);
      }}>
        Level Up!
      </button>
    </>
  );
}
```

**Features:**
- **Fullscreen Overlay**: Captures user attention
- **Expanding Rings**: Concentric circle animations
- **Dramatic Text**: Glowing "LEVEL UP!" heading
- **Large Level Display**: Center focal point
- **Floating Particles**: Scattered animation effects
- **Auto-dismiss**: Completes after 3 seconds
- **Sound-ready**: Structure ready for SFX integration

---

## 🎨 CSS Anime Utilities

Add anime vibes to any element with CSS utilities.

### Glow Effects

```html
<!-- Dramatic purple glow -->
<div class="glow-dramatic">Content</div>

<!-- Purple specific -->
<div class="glow-purple">Content</div>

<!-- Rose/Red glow -->
<div class="glow-rose">Content</div>

<!-- Intense cyan glow -->
<div class="glow-cyan-intense">Content</div>
```

### Gradient Backgrounds

```html
<!-- Purple anime gradient -->
<div class="gradient-anime-purple">Content</div>

<!-- Dramatic multi-color gradient -->
<div class="gradient-anime-dramatic">Content</div>

<!-- Rose-focused gradient -->
<div class="gradient-anime-rose">Content</div>
```

### Border Glows

```html
<!-- Cyan glowing border -->
<div class="border-glow-cyan">Content</div>

<!-- Purple glowing border -->
<div class="border-glow-purple">Content</div>

<!-- Rose glowing border -->
<div class="border-glow-rose">Content</div>
```

### Text Glows

```html
<!-- Cyan glowing text -->
<p class="text-glow-cyan">Glowing text</p>

<!-- Purple glowing text -->
<p class="text-glow-purple">Glowing text</p>

<!-- Rose glowing text -->
<p class="text-glow-rose">Glowing text</p>
```

### Animation Effects

```html
<!-- Shimmer effect -->
<div class="shimmer-anime">Content</div>

<!-- Pulsing glow -->
<div class="pulse-glow">Content</div>

<!-- Breathing effect (Demon Slayer style) -->
<div class="breathing">Content</div>

<!-- Dramatic entrance animation -->
<div class="dramatic-enter">Content</div>

<!-- Epic focus highlight -->
<button class="anime-focus">Click me</button>
```

---

## 🎯 Design Patterns

### Power Progression Flow

```tsx
<div className="space-y-6">
  {/* Current power display */}
  <PowerLevel {...stats} />

  {/* Tier progression */}
  <RankingTier {...rankData} />

  {/* Available quests */}
  <div className="grid gap-4">
    <AnimeQuestCard {...quest1} />
    <AnimeQuestCard {...quest2} />
  </div>

  {/* Achievements */}
  <div className="grid grid-cols-4 gap-2">
    <AnimeAchievementCard {...achievement} />
  </div>
</div>
```

### Dashboard Integration

```tsx
import { PowerLevel } from '@/components/anime/PowerLevel';
import { RankingTier } from '@/components/anime/RankingTier';
import { AnimeQuestCard } from '@/components/anime/AnimeQuestCard';
import { XPProgressChart } from '@/components/dashboard/XPProgressChart';

export function EpicDashboard() {
  return (
    <div className="space-y-8">
      <section className="grid lg:grid-cols-2 gap-6">
        <PowerLevel {...} />
        <RankingTier {...} />
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <XPProgressChart {...} />
        </div>
        <div className="space-y-4">
          <AnimeQuestCard status="active" {...} />
          <AnimeQuestCard status="locked" {...} />
        </div>
      </section>
    </div>
  );
}
```

---

## 🔥 Color Palette

### Anime Colors

| Use | Color | Hex | Effect |
|-----|-------|-----|--------|
| Primary Glow | Cyan | #06b6d4 | Electric energy |
| Secondary Glow | Violet/Purple | #a855f7 | Magical power |
| Danger/Fire | Rose | #f43f5e | Intense threat |
| Legendary | Amber/Gold | #fbbf24 | Premium tier |
| Success | Emerald | #10b981 | Quest complete |

### Rank Colors (Solo Leveling)

```
E-Rank: #475569 (Slate)
D-Rank: #10b981 (Emerald)
C-Rank: #0ea5e9 (Blue)
B-Rank: #8b5cf6 (Purple)
A-Rank: #fb923c (Orange)
S-Rank: #f43f5e (Rose)
SS-Rank: #eab308 (Gold)
SSS-Rank: #06b6d4 (Cyan - Legendary)
```

---

## 🎬 Animation Timings

All anime effects use these predefined timing:

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🌟 Best Practices

### 1. Power Progression

Show progression dramatically:
```tsx
// ✅ Good - Creates narrative of growth
<PowerLevel level={10} rank="E" />
<RankingTier rank={1} />
<XPProgressChart data={data} />

// ❌ Avoid - Static, boring
<div>Level 10 - Rank E</div>
```

### 2. Achievement Celebration

Celebrate wins visually:
```tsx
// ✅ Good - Epic moment
<LevelUpAnimation isVisible={true} newLevel={25} />
<AnimeAchievementCard unlocked={true} rarity="legendary" />

// ❌ Avoid - Mundane notification
<Toast message="Level up!" />
```

### 3. Quest Difficulty Communication

Be clear about challenge:
```tsx
// ✅ Good - Difficulty is obvious
<AnimeQuestCard difficulty="S" title="Boss Battle" />

// ❌ Avoid - Unclear difficulty
<Card title="Boss Battle" difficulty={5} />
```

### 4. Consistent Glow Usage

Match glow intensity to importance:
```tsx
// Important element
<div className="glow-dramatic">Critical action</div>

// Secondary element
<div className="glow-purple">Secondary action</div>

// Tertiary element
<div class="glass-dark">Tertiary action</div>
```

---

## 📱 Responsive Behavior

All anime components are fully responsive:

```tsx
// Desktop: Full size with all effects
// Tablet: Slightly smaller with same quality
// Mobile: Touch-optimized, maintains visual impact
<AnimeQuestCard
  // Auto-scales based on viewport
/>
```

---

## ♿ Accessibility

All anime effects respect accessibility preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled */
  /* Components remain fully functional */
}
```

---

## 🎮 Integration Examples

### With React State

```tsx
const [level, setLevel] = useState(1);
const [showLevelUp, setShowLevelUp] = useState(false);

const handleQuestComplete = () => {
  setLevel(prev => prev + 1);
  setShowLevelUp(true);
};

<LevelUpAnimation
  isVisible={showLevelUp}
  newLevel={level}
  onComplete={() => setShowLevelUp(false)}
/>
```

### With API Data

```tsx
const { data: userStats } = useFetch('/api/user-progress');

<PowerLevel
  level={userStats.level}
  maxLevel={100}
  rank={calculateRank(userStats.xp)}
  xp={userStats.xp}
  maxXp={userStats.xpForNextLevel}
/>
```

---

## 🚀 Performance

All anime components:
- ✅ Use CSS transforms (GPU accelerated)
- ✅ Optimize Framer Motion animations
- ✅ Lazy-load heavy effects
- ✅ Support `will-change` hints
- ✅ Maintain 60 FPS on modern devices

---

## 🎨 Customization

Components are designed to be themeable:

```tsx
// Override colors via CSS variables
<style>
  :root {
    --anime-primary: #06b6d4;
    --anime-secondary: #a855f7;
    --anime-danger: #f43f5e;
  }
</style>

// Components automatically use these colors
<PowerLevel rank="S" /> {/* Uses CSS variables */}
```

---

## 📚 See Also

- `COMPONENT_LIBRARY.md` - All available components
- `DESIGN_SYSTEM.md` - Core design tokens
- `ENTERPRISE_UPGRADE_PROGRESS.md` - Feature status

---

*Last Updated: May 19, 2026*  
**Theme:** Epic Anime Progression System  
**Inspiration:** Solo Leveling 🔥 + Demon Slayer ⚡
