# **Table of Contents**

# Objective

- EcoQuest is a gamified mobile app for Brazilian waste pickers that transforms waste collection tracking into an RPG-like experience. The design system is built around accessibility, engagement, and a futuristic dark theme with vibrant neon accents.

# Background

- What is the problem you’re trying to solve?
- Discuss existing implementations
- What’s missing in those existing implementations?

# Requirements

**Target Audience**: Waste pickers of all age groups in Brazil

**Primary Platform**: Mobile-first (max-width: 28rem/448px)

**Design Philosophy**: Multimodal communication through text, symbols, and colour coding

# Brand Book

- Style
- Logo
- Colours

# Brand Archetypes

# Design

- Include any relevant UI mocks or architecture diagrams
- What should the expected final state of this change look like?

---

# Core Design Principles

### 1. Accessibility First

- **Large touch targets**: Minimum 44x44px for buttons and interactive elements
- **High contrast**: Neon colours against dark backgrounds ensure readability
- **Multimodal communication**: Every concept uses text + icons/emojis + colour
- **Simple language**: Short Portuguese phrases designed for all literacy levels
- **Visual hierarchy**: Clear information structure with size and colour differentiation

### 2. Gamification & Engagement

- **RPG aesthetics**: Dark futuristic theme with glowing neon elements
- **Visual feedback**: Animated progress bars, glowing effects, and status indicators
- **Reward visibility**: XP gains, badges, and achievements prominently displayed
- **Progress transparency**: Always show current state vs. goals

### 3. Mobile-First Optimization

- **Thumb-friendly navigation**: Bottom navigation bar for easy one-handed use
- **Compact information density**: Card-based layouts prevent overwhelming users
- **Touch-optimized spacing**: Generous padding and margins (0.75rem-1rem)
- **Scrollable content**: Vertical scrolling as primary navigation pattern

---

## Global Design Choices

### colour System

### Background colours

```css
--quest-bg: #0a0e1a          /* Deep navy - Primary background */
--quest-surface: #1a1f2e     /* Slate blue - Card backgrounds */
--quest-border: #2a3441      /* Muted blue-grey - Borders and dividers */

```

**Rationale**: Dark backgrounds reduce eye strain, extend battery life on OLED screens, and create a futuristic gaming atmosphere. The three-tier hierarchy (bg → surface → border) creates subtle depth.

### Neon Accent colours

```css
--neon-blue: #00d4ff         /* Cyan - Primary actions, XP */
--neon-magenta: #ff00d4      /* Pink - Weekly challenges, special features */
--neon-emerald: #00ff88      /* Green - Success, environmental impact */
--neon-gold: #ffd700         /* Gold - Rewards, achievements, currency */
--energy-bar: #ff6b35        /* Orange - Energy/activity indicators */

```

**Rationale**:

- **High visibility**: Neon colours pop against dark backgrounds, ensuring critical information stands out
- **Semantic meaning**: Each colour has consistent contextual usage
    - Blue = Primary/Active state
    - Green = Success/Positive impact
    - Gold = Rewards/Value
    - Magenta = Special/Time-based
    - Orange = Energy/Action required
- **Cultural resonance**: Neon aesthetics evoke gaming/tech culture, appealing to younger users while remaining clear for older users

### Functional Colours

```css
--foreground: oklch(0.985 0 0)     /* Nearly white - Primary text */
--muted-foreground: oklch(0.708 0 0) /* Grey - Secondary text */
--primary: #00d4ff                  /* Neon blue - Primary brand */
--destructive: oklch(0.396 0.141 25.723) /* Red - Warnings */

```

**Rationale**: OKLCH colour space provides perceptually uniform brightness, ensuring text remains readable across all colour combinations.

---

### Typography

### Font Sizing

```css
--font-size: 14px  /* Base size */
```

**Element Hierarchy**:

- **h1**: Equivalent to text-2xl (2rem ≈ 28px) - Main section headers
- **h2**: Equivalent to text-xl (1.5rem ≈ 21px) - Card titles
- **h3**: Equivalent to text-lg (1.125rem ≈ 16px) - Subsection headers
- **h4**: Equivalent to text-base (1rem ≈ 14px) - Component headers
- **p**: text-base (14px) - Body text
- **small**: text-sm (0.875rem ≈ 12px) - Labels, metadata
- **tiny**: text-xs (0.75rem ≈ 11px) - Auxiliary information

**Rationale**:

- 14px base provides readability on mobile devices without requiring zoom
- Consistent 1.5 line-height improves reading comprehension
- Limited scale (only 4-5 sizes) prevents visual chaos
- All text uses standard weights (400/500) - no bold/heavy to maintain clean aesthetic

### Font Weights

```css
--font-weight-normal: 400   /* Body text, inputs */
--font-weight-medium: 500   /* Headers, buttons, labels */

```

**Rationale**: Two weights only - simpler visual hierarchy, faster rendering, better legibility on lower-quality screens.

---

### Border Radius

```css
--radius: 0.625rem (10px)         /* Base radius */
--radius-sm: 6px                  /* Small elements (badges, tags) */
--radius-md: 8px                  /* Medium elements (buttons) */
--radius-lg: 10px                 /* Large elements (cards) */
--radius-xl: 14px                 /* Extra large (special cards) */

```

**Usage**:

- **Cards**: `rounded-xl` (12px) - Large enough to feel modern, not so much to waste space
- **Buttons**: `rounded-md` (8px) - Softer than sharp corners, maintains clickable feel
- **Badges**: `rounded-md` (8px) - Pill-like shape for tag aesthetic
- **Progress bars**: `rounded-full` - Completely rounded for smooth energy bar feel
- **Avatars**: `rounded-full` - Perfect circles for profile pictures

**Rationale**: Rounded corners soften the harsh tech aesthetic, making the app feel friendlier. Consistent rounding (6-14px range) creates visual harmony.

---

### Spacing System

**Base Unit**: 0.25rem (4px)

**Common Patterns**:

- **Component padding**: `p-4` (1rem/16px) - Cards, buttons
- **Section gaps**: `gap-4` or `space-y-4` (1rem) - Between cards
- **Content padding**: `px-6` (1.5rem/24px) - Card internal padding
- **Small gaps**: `gap-2` or `gap-3` (8px-12px) - Between icons and text
- **Bottom navigation clearance**: `pb-20` (5rem/80px) - Space for fixed nav

**Rationale**:

- 4px base unit creates rhythm and consistency
- Generous spacing (16-24px) improves touch targets and reduces cognitive load
- Mobile-optimized: enough white space without wasting screen real estate

---

### Gradients

### Background Gradients

```tsx
// Full page background
className="bg-gradient-to-br from-quest-bg via-quest-surface to-quest-bg"

```

**Rationale**: Subtle radial variation creates depth without distraction. Diagonal (br = bottom-right) adds dynamism.

### Card Gradients

```tsx
// Standard card
className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm"

```

**Rationale**:

- Transparency (80% → 40%) creates glassmorphism effect
- `backdrop-blur-sm` adds depth perception
- Top-left brighter, bottom-right darker guides eye flow

### Accent Gradients

```tsx
// Success/specialty cards
className="bg-gradient-to-br from-neon-emerald/10 to-transparent"
className="bg-gradient-to-r from-neon-blue to-neon-magenta"

```

**Rationale**:

- Low opacity (10%) provides subtle color tint without overwhelming
- Two-color gradients (blue→magenta) create premium feel for special elements
- Transparency allows background to show through, maintaining cohesion

---

### Shadows & Depth

### Glow Effects

```css
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue), 0 0 15px var(--neon-blue);
  }
  50% {
    box-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue), 0 0 30px var(--neon-blue);
  }
}

```

**Rationale**:

- Triple shadow layers create authentic neon tube effect
- Pulsing animation draws attention to important elements
- Used sparingly to avoid overwhelming the UI

### Borders

- **Default**: `border border-quest-border` (1px solid #2a3441)
- **Accent borders**: `border-neon-blue/30` (30% opacity for subtle glow)
- **Emphasis**: `border-2` for active/selected states

**Rationale**:

- Thin borders (1px) define spaces without chunking the layout
- 30% opacity on colored borders prevents harshness
- 2px borders provide clear focus indicators

### Animations

```css
/* Custom animations */
@keyframes glow { /* Neon pulsing effect */ }
@keyframes pulse-glow { /* Softer emerald glow */ }
@keyframes xp-fill { /* Progress bar filling */ }
@keyframes coin-spin { /* Reward celebration */ }

```

**Usage Principles**:

- **Duration**: 0.6s-2s (quick enough to feel responsive, slow enough to be noticeable)
- **Easing**: `ease-in-out` for smooth, natural motion
- **Infinite loops**: Only for ambient effects (background pulse)
- **One-time**: For user actions (XP fill, coin spin)

**Rationale**: Animations provide feedback, celebrate achievements, and maintain engagement without causing motion sickness.

### Transitions

```tsx
className="transition-all"  // Standard (all properties, 150ms)
className="transition-colors"  // Color changes only
className="transition-opacity"  // Fade effects

```

**Rationale**:

- CSS transitions are more performant than animations for simple state changes
- `transition-all` is used sparingly (can cause jank with layout changes)
- Specific transitions (colors, opacity) perform better on mobile

---

## Component Design Analysis

### 1. Header Component (GameHeader)

**Location**: Fixed top of screen

**Purpose**: Identity, level progression, quick stats

### Design Choices

**Background**:

```tsx
className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm border-b border-quest-border"

```

- **Gradient**: Left-to-right (90%→70% opacity) creates subtle visual interest
- **Backdrop blur**: Glassmorphism effect maintains depth when content scrolls beneath
- **Border bottom**: Separates header from content without harsh line

**Avatar**:

```tsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-magenta flex items-center justify-center">
  <Recycle className="w-5 h-5 text-white" />
</div>

```

- **Size**: 40x40px - Large enough to be recognizable, small enough to not dominate
- **Gradient**: Blue→magenta represents brand colors, creates premium feel
- **Icon**: White recycle symbol ensures brand recognition
- **Round shape**: Friendly, approachable aesthetic

**User Info**:

```tsx
<div className="font-medium">{mockUser.name}</div>
<div className="text-sm text-muted-foreground">Nível {mockUser.level} • {mockUser.tier}</div>

```

- **Name**: Default font-medium (500) for emphasis
- **Subtitle**: text-sm + muted-foreground reduces visual weight
- **Separator**: Bullet (•) is minimal, language-agnostic

**XP Progress**:

```tsx
<div className="text-sm text-neon-gold">XP: {mockUser.xp}/{mockUser.xpToNext}</div>
<div className="w-16 h-1.5 rounded-full bg-secondary mt-1">
  <div className="h-full rounded-full bg-neon-gold transition-all"
       style={{ width: `${(mockUser.xp / mockUser.xpToNext) * 100}%` }}/>
</div>

```

- **Gold color**: Associates XP with value/reward
- **Compact bar**: 64px × 6px - visible but not intrusive
- **Percentage text**: Transparent progression system
- **Rounded-full**: Smooth, modern aesthetic
- **Transition**: Smooth animation when XP changes

**Why This Design Fits**:

- **Persistent identity**: User always knows who they are and their progress
- **Motivational**: Seeing XP bar encourages next action
- **Mobile-optimized**: Compact design (48px height) maximizes content area
- **Glassmorphism**: Modern tech aesthetic aligns with RPG theme

---

### 2. Bottom Navigation

**Location**: Fixed bottom of screen

**Purpose**: Primary navigation between 5 main sections

### Design Choices

**Container**:

```tsx
className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md
           bg-card/95 backdrop-blur-sm border-t border-quest-border"

```

- **Fixed positioning**: Always accessible, doesn't scroll away
- **Centered**: `left-1/2 -translate-x-1/2` centers on mobile devices
- **Max-width**: 28rem matches main content container
- **95% opacity**: Slight transparency shows content beneath (depth cue)
- **Backdrop blur**: Content behind is softly blurred
- **Border top**: Subtle separator from content

**Navigation Items**:

```tsx
<button className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
  isActive ? "text-neon-blue bg-neon-blue/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
}`}>
  <IconComponent className="w-5 h-5" />
  <span className="text-xs">{item.label}</span>
</button>

```

**Active State**:

- **Color**: `text-neon-blue` - Primary brand color
- **Background**: `bg-neon-blue/10` - 10% opacity creates subtle highlight
- **No border**: Cleaner look, color differentiation is sufficient

**Inactive State**:

- **Color**: `text-muted-foreground` - Recedes into background
- **Hover**: Brightens to `text-foreground` + `bg-secondary/20` for feedback

**Layout**:

- **5 items**: Optimal for mobile (3-7 items is standard)
- **Icon above label**: Vertical stack saves horizontal space
- **20x20px icons**: Large enough to recognize, small enough to fit
- **text-xs labels**: 12px - readable but compact
- **gap-1**: 4px between icon and text - tight coupling

**Touch Targets**:

- **Padding**: `p-2` (8px all around)
- **Total size**: ~52px height × 70px width - exceeds 44px minimum
- **Spacing**: `justify-around` creates equal gaps

**Why This Design Fits**:

- **Thumb zone**: Bottom placement is easiest to reach one-handed
- **Clear affordance**: Icons + text removes ambiguity
- **Immediate feedback**: Active state clearly shows current location
- **Mobile standard**: Pattern users expect from other apps
- **Efficient**: 5 sections accessible in one tap from anywhere

---

### 3. Card Component (Base)

**Purpose**: Primary container for all content sections

### Design Choices

**Base Styles**:

```tsx
className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border"

```

- **Background**: `bg-card` (#1a1f2e) - Slate blue surface color
- **Text**: `text-card-foreground` - Nearly white for contrast
- **Layout**: `flex flex-col` - Vertical stacking of header/content/footer
- **Gap**: `gap-6` (1.5rem/24px) - Generous spacing between sections
- **Radius**: `rounded-xl` (12px) - Modern, friendly corners
- **Border**: 1px solid border-quest-border - Subtle definition

**Common Variant** (Used throughout app):

```tsx
className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-quest-border"

```

- **Gradient**: 80%→40% opacity creates depth
- **Backdrop blur**: Glassmorphism effect
- **Explicit border**: Ensures border color even when custom styling applied

**Accent Variants**:

```tsx
// Success/environmental
className="bg-gradient-to-br from-neon-emerald/10 to-transparent border-neon-emerald/30"

// Primary/info
className="bg-gradient-to-br from-neon-blue/5 to-transparent border-neon-blue/30"

// Reward/value
className="bg-gradient-to-br from-neon-gold/5 to-transparent border-neon-gold/30"

// Special/time-based
className="bg-gradient-to-br from-neon-magenta/5 to-transparent border-neon-magenta/30"

```

- **Low opacity**: 5-10% color tint doesn't overwhelm
- **Transparent end**: Fades to background
- **Matching border**: 30% opacity ties color scheme together

**Header**:

```tsx
className="px-6 pt-6"  // CardHeader

```

- **Horizontal padding**: 24px creates comfortable margins
- **Top padding**: 24px prevents cramping against border
- **Bottom**: Dynamic based on content (pb-6 if border-b exists)

**Content**:

```tsx
className="px-6 [&:last-child]:pb-6"  // CardContent

```

- **Side padding**: Matches header for alignment
- **Bottom padding**: Only if it's the last element (prevents double spacing)

**Why This Design Fits**:

- **Flexible container**: Works for any content type
- **Visual hierarchy**: Rounded corners + shadows separate from background
- **Glassmorphism**: Modern, tech-forward aesthetic
- **Consistent spacing**: 24px padding throughout maintains rhythm
- **Color coding**: Border/background colors provide instant semantic meaning

---

### 4. Button Component

**Purpose**: Primary interaction element for all actions

### Design Choices

**Base Styles**:

```tsx
className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
           text-sm font-medium transition-all"

```

- **Display**: `inline-flex` allows buttons to size to content
- **Alignment**: `items-center justify-center` perfectly centers content
- **Icon gap**: `gap-2` (8px) between icon and text
- **No wrap**: `whitespace-nowrap` prevents awkward line breaks
- **Radius**: `rounded-md` (8px) - softer than cards, still rounded
- **Text**: `text-sm` (14px) - same as base font, font-medium (500) for emphasis
- **Transition**: `transition-all` for smooth state changes

**Variants**:

**Default (Primary)**:

```tsx
variant="default"
className="bg-primary text-primary-foreground hover:bg-primary/90"

```

- **Background**: Neon blue (#00d4ff)
- **Text**: Dark background color for contrast
- **Hover**: 90% opacity dims slightly
- **Use case**: Main CTAs (Submit, Save, Continue)

**Outline**:

```tsx
variant="outline"
className="border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"

```

- **Background**: Transparent/dark background
- **Border**: 1px solid
- **Hover**: Fills with accent color
- **Use case**: Secondary actions (Cancel, More Info)

**Ghost**:

```tsx
variant="ghost"
className="hover:bg-accent hover:text-accent-foreground"

```

- **No background**: Invisible until hover
- **Hover**: Subtle highlight
- **Use case**: Tertiary actions (Info buttons, less important actions)

**Sizes**:

```tsx
size="sm"   // h-8 (32px) - Compact for tight spaces
size="default"  // h-9 (36px) - Standard action button
size="lg"   // h-10 (40px) - Important primary actions
size="icon" // size-9 (36×36px) - Square for icon-only buttons

```

**Custom Neon Variants** (App-specific):

```tsx
// Success action
className="bg-neon-emerald/20 hover:bg-neon-emerald/30 text-neon-emerald border-neon-emerald/30"

// Warning/energy action
className="bg-energy-bar/20 hover:bg-energy-bar/30 text-energy-bar border-energy-bar/30"

```

- **20%/30% opacity**: Visible but not overwhelming
- **Matching text and border**: Cohesive color scheme
- **Hover darkens**: Provides clear interaction feedback

**Why This Design Fits**:

- **Clear affordance**: Rounded rectangle is universal button shape
- **Touch-friendly**: Minimum 32px height, generous padding
- **Consistent sizing**: 3 sizes cover all use cases without proliferation
- **Color semantics**: Variants match action importance
- **Neon integration**: Custom variants maintain RPG aesthetic
- **Accessible**: High contrast, clear focus states

---

### 5. Badge Component

**Purpose**: Display status, categories, achievements, and metadata

### Design Choices

**Base Styles**:

```tsx
className="inline-flex items-center justify-center rounded-md border px-2 py-0.5
           text-xs font-medium w-fit whitespace-nowrap"

```

- **Display**: `inline-flex` sizes to content
- **Padding**: Compact (8px horizontal, 2px vertical)
- **Radius**: `rounded-md` (8px) - pill-like shape
- **Border**: 1px for definition
- **Text**: `text-xs` (12px) - smaller than body, font-medium for readability
- **Width**: `w-fit` prevents stretching
- **No wrap**: Keeps badge compact

**Standard Variants**:

```tsx
variant="default"  // Primary color background
variant="outline"  // Transparent with border
variant="secondary"  // Muted background

```

**Custom Color Badges** (App-specific):

**Rarity Badges**:

```tsx
// Common
className="bg-gray-500/20 text-gray-400 border-gray-500/30"

// Rare
className="bg-blue-500/20 text-blue-400 border-blue-500/30"

// Epic
className="bg-purple-500/20 text-purple-400 border-purple-500/30"

// Legendary (implied)
className="bg-yellow-500/20 text-neon-gold border-yellow-500/30"

```

- **Color progression**: Gray → Blue → Purple → Gold matches gaming conventions
- **20% background**: Subtle color wash
- **30% border**: Slightly more pronounced
- **Pastel text**: 400 weight colors are softer, more premium

**Tier Badges**:

```tsx
// Iniciante
className="bg-gray-500/10 text-gray-400 border-gray-500/30"

// Aprendiz
className="bg-green-500/10 text-green-400 border-green-500/30"

// Experiente
className="bg-blue-500/10 text-blue-400 border-blue-500/30"

// Especialista
className="bg-purple-500/10 text-purple-400 border-purple-500/30"

// Mestre
className="bg-yellow-500/10 text-neon-gold border-yellow-500/30"

```

- **10% background**: Even more subtle than rarity
- **Progression**: Gray → Green → Blue → Purple → Gold shows advancement
- **Consistent with RPG**: Tier names and colors match game conventions

**Status Badges**:

```tsx
// Active
className="bg-neon-emerald/20 text-neon-emerald border-neon-emerald/30"

// Today total
className="bg-neon-emerald/20 text-neon-emerald border-neon-emerald/30"

// Participants count
className="border-quest-border"  // Neutral outline

```

**Why This Design Fits**:

- **Information density**: Compact size allows multiple badges without clutter
- **Color semantics**: Instant recognition of status/category/achievement level
- **Gaming convention**: Rarity/tier colors match RPG expectations
- **Scannable**: Small, distinct shapes draw eye to key metadata
- **Flexible**: Works inline with text or standalone
- **Consistent opacity**: 10-20% backgrounds maintain visual balance

---

### 6. Progress Bar Component

**Purpose**: Visualize completion, XP, goals, and challenges

### Design Choices

**Container**:

```tsx
<div className="w-full h-2 rounded-full bg-secondary">

```

- **Width**: Full width of parent - adapts to context
- **Height**: 8px (`h-2`) - thin enough to not dominate, thick enough to see
- **Radius**: `rounded-full` - completely rounded ends (pill shape)
- **Background**: `bg-secondary` (#2a3441) - muted track color

**Fill Bar**:

```tsx
<div className="h-full rounded-full bg-neon-blue transition-all"
     style={{ width: `${percentage}%` }}/>

```

- **Height**: Matches container (8px)
- **Radius**: Also `rounded-full` - creates smooth pill regardless of fill
- **Dynamic width**: Inline style allows any percentage
- **Transition**: Smooth animation when value changes

**Color Variants**:

```tsx
bg-neon-blue      // XP, primary progress
bg-neon-gold      // Rewards, achievements
bg-neon-emerald   // Environmental impact, success
bg-neon-magenta   // Weekly challenges, special goals
bg-energy-bar     // Energy, activity levels

```

- **Semantic colors**: Each context has consistent color
- **High contrast**: All neon colors pop against dark secondary background

**Size Variants**:

```tsx
h-1.5  // 6px - Very compact (header XP)
h-2    // 8px - Standard (most progress bars)
h-3    // 12px - Emphasized (important goals)

```

**Context Usage**:

**XP Header Bar**:

```tsx
<div className="w-16 h-1.5 rounded-full bg-secondary">
  <div className="h-full rounded-full bg-neon-gold" style={{width: "84%"}}/>
</div>

```

- **Compact**: 64×6px - fits in header
- **Gold**: XP is valuable

**Challenge Progress**:

```tsx
<div className="w-full h-2 rounded-full bg-secondary mt-2">
  <div className="h-full rounded-full bg-neon-blue transition-all" style={{width: "64%"}}/>
</div>

```

- **Standard**: 8px height
- **Blue**: Primary challenge color
- **Full width**: Shows in card context

**Level Specialization**:

```tsx
<Progress value={progressPercent} className="h-2" />

```

- **Component**: Uses ShadCN Progress component
- **Height override**: Maintains 8px consistency

**Why This Design Fits**:

- **Clear visualization**: Pill shape is universally understood
- **Smooth animation**: Transitions create satisfying feedback
- **Color coding**: Instant understanding of what's being measured
- **Scalable**: Works from 64px to full screen width
- **Motivational**: Seeing progress encourages completion
- **Minimal**: Thin design doesn't clutter interface

---

### 7. Waste Registration Component

**Purpose**: Display latest weighing and history

### Design Choices

**Latest Weighing Card**:

**Dynamic Border**:

```tsx
className={`border-2 ${latestTypeData?.borderColor || 'border-quest-border'}`}

```

- **2px border**: Thicker than standard to emphasize importance
- **Dynamic color**: Matches waste type (blue for plastic, gold for metal, etc.)
- **Fallback**: Default border if no type data

**Large Weight Display**:

```tsx
<div className="text-center py-8">
  <div className="text-6xl mb-2">♻️</div>
  <div className="text-5xl mb-2 text-neon-blue">8.5 kg</div>
  <div className="text-xl text-muted-foreground">Plástico</div>
</div>

```

- **Emoji**: 60px (text-6xl) - immediate visual recognition
- **Weight**: 48px (text-5xl) - dominant information
- **Material**: 20px (text-xl) - secondary but clear
- **Color**: Matches material type
- **Centered**: `text-center` focuses attention
- **Vertical rhythm**: 8px spacing creates hierarchy

**Metadata**:

```tsx
<div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
  <div className="flex items-center gap-1">
    <Clock className="w-4 h-4" />14:30
  </div>
  <div className="flex items-center gap-1">
    <MapPin className="w-4 h-4" />Bairro Centro
  </div>
</div>

```

- **Icons**: 16×16px - small, recognizable
- **Text**: text-sm (14px) - readable but secondary
- **Gap**: 16px between time and location
- **Icon-text gap**: 4px - tight coupling
- **Muted color**: Reduces visual weight

**Reward Cards**:

```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="p-4 rounded-lg bg-neon-emerald/10 border border-neon-emerald/30">
    <div className="text-2xl text-neon-gold">+85 XP</div>
    <div className="text-xs text-muted-foreground">Experiência Ganha</div>
  </div>
  {/* CO2 card */}
</div>

```

- **2-column grid**: Efficient use of space
- **Color-coded**: Different colors for XP vs CO2
- **Large numbers**: text-2xl (24px) draws attention
- **Tiny labels**: text-xs (12px) provides context

**Success Indicator**:

```tsx
<div className="flex items-center justify-center gap-2 text-neon-emerald bg-neon-emerald/10 p-3 rounded-lg">
  <CheckCircle className="w-5 h-5" />
  <span>Pesagem registrada com sucesso!</span>
</div>

```

- **Green**: Success color
- **Icon + text**: Multimodal confirmation
- **Full width**: Spans card for visibility
- **Padded**: 12px padding makes it substantial

**Tabbed History**:

**Tab List**:

```tsx
<TabsList className="grid w-full grid-cols-2">
  <TabsTrigger value="today">Hoje</TabsTrigger>
  <TabsTrigger value="history">Histórico</TabsTrigger>
</TabsList>

```

- **2 tabs**: Simple choice (today vs all history)
- **Grid layout**: Equal-width tabs
- **Portuguese labels**: Localized for Brazilian users

**History Entry**:

```tsx
<div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-quest-border">
  <div className="flex items-center gap-3">
    <div className="text-2xl">♻️</div>
    <div>
      <div className="font-medium">Plástico</div>
      <div className="text-sm text-muted-foreground">Bairro Centro • 14:30</div>
    </div>
  </div>
  <div className="text-right">
    <div className="font-medium text-lg text-neon-blue">8.5 kg</div>
    <div className="text-xs text-muted-foreground">+85 XP</div>
  </div>
</div>

```

- **Horizontal layout**: Efficient for list items
- **Icon**: 24px emoji - quick scanning
- **Two-line text**: Material + location/time
- **Right-aligned numbers**: Easy to compare values
- **Hover state**: `hover:bg-secondary/30` - subtle feedback

**Quick Stats Grid**:

```tsx
<div className="grid grid-cols-2 gap-3">
  <Card className="bg-gradient-to-br from-neon-blue/5 to-transparent border-neon-blue/30">
    <CardContent className="p-3 text-center">
      <div className="text-xl text-neon-blue">2</div>
      <div className="text-xs text-muted-foreground">Pesagens Hoje</div>
    </CardContent>
  </Card>
  {/* XP card */}
</div>

```

- **2 columns**: Fits mobile width
- **Compact padding**: p-3 (12px) saves space
- **Color gradients**: Subtle backgrounds
- **Centered text**: Clean, organized look

**Why This Design Fits**:

- **Celebratory**: Large display celebrates achievement
- **Clear hierarchy**: Most recent weighing is dominant
- **Multimodal**: Emoji + text + color communicates to all users
- **Efficient tabs**: Easy switch between today and history
- **Scannable**: List format allows quick review
- **Motivational**: XP rewards prominently displayed
- **External integration**: Design accommodates weighing happening elsewhere

---

### 8. Waste Categories Component

**Purpose**: Show material specialization and progression

### Design Choices

**Overview Card**:

**4-Stat Grid**:

```tsx
<div className="grid grid-cols-2 gap-4 mb-6">
  <div className="text-center">
    <div className="text-xl font-medium text-neon-emerald">245.5 kg</div>
    <div className="text-xs text-muted-foreground">Total Coletado</div>
  </div>
  {/* Other stats */}
</div>

```

- **2×2 grid**: Fits mobile screen perfectly
- **Color-coded values**: Each stat has semantic color
    - Emerald: Total waste (environmental)
    - Gold: Points (reward)
    - Blue: Specialties (achievement)
    - Magenta: Max level (progression)
- **text-xl**: 20px - prominent but not overwhelming
- **text-xs labels**: 12px - compact but readable
- **Gap**: 16px creates breathing room

**Category Cards**:

**Hover Effect**:

```tsx
className="hover:border-neon-blue/30 transition-all cursor-pointer group"

```

- **Border color change**: Subtle interaction cue
- **Cursor**: Changes to pointer
- **Group**: Enables child hover effects
- **Transition**: Smooth animation

**Icon Container**:

```tsx
<div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
     style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}30` }}>
  {category.icon}
</div>

```

- **Size**: 48×48px - large enough to see emoji clearly
- **Rounded**: 8px matches button radius
- **Dynamic background**: 20% opacity of category color
- **Dynamic border**: 30% opacity of category color
- **Emoji size**: text-2xl (24px) - fills container well

**Tier Badge**:

```tsx
<Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
  Nível 3 - Experiente
</Badge>

```

- **Color progression**: Changes based on level (1-5)
- **Combined text**: Level number + tier name for clarity
- **10% background**: Very subtle color wash

**Stats Grid**:

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <div className="text-lg font-medium" style={{ color: category.color }}>
      85.2 kg
    </div>
    <div className="text-sm text-muted-foreground">Total Coletado</div>
  </div>
  <div>
    <div className="text-lg font-medium text-neon-gold">852</div>
    <div className="text-sm text-muted-foreground">Pontos</div>
  </div>
</div>

```

- **2 columns**: Efficient layout
- **Dynamic color**: Weight matches material color
- **Gold points**: Consistent reward color
- **text-lg**: 18px - secondary hierarchy (smaller than overview)

**Level Progress**:

```tsx
<div className="flex justify-between text-sm">
  <span>Progresso Nível 3</span>
  <span className="text-muted-foreground">85.2/100 kg</span>
</div>
<Progress value={85.2} className="h-2" />

```

- **Label row**: Shows what's being measured + current/target
- **Progress bar**: Visual representation
- **text-sm**: 14px - readable but compact

**Next Level Preview**:

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 rounded-lg p-2">
  <Target className="w-4 h-4" />
  <span>Próximo nível: +148 XP bônus</span>
</div>

```

- **Icon + text**: Target icon clarifies this is a goal
- **Muted background**: Secondary information
- **Compact padding**: 8px all around
- **Motivational**: Shows reward for next level

**Master Badge**:

```tsx
<div className="flex items-center gap-2 text-sm bg-neon-gold/10 border border-neon-gold/30 rounded-lg p-2">
  <Trophy className="w-4 h-4 text-neon-gold" />
  <span className="text-neon-gold">Mestre em Papel!</span>
</div>

```

- **Gold theme**: Premium achievement color
- **Trophy icon**: Universal symbol of mastery
- **Replaces progress**: Shows achievement instead of next goal

**CO2 Impact**:

```tsx
<div className="pt-2 border-t border-quest-border">
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Impacto CO₂:</span>
    <span className="text-neon-emerald">-62.2 kg</span>
  </div>
</div>

```

- **Border top**: Separates from stats
- **Green color**: Environmental benefit
- **Negative sign**: Clarifies this is reduction
- **Right-aligned**: Number easy to scan

**Tips Card**:

**Accent Background**:

```tsx
className="bg-gradient-to-br from-neon-blue/5 to-neon-emerald/5 border-neon-blue/30"

```

- **Dual gradient**: Blue→emerald creates unique look
- **5% opacity**: Very subtle, doesn't compete with content
- **Blue border**: Primary color ties to theme

**Tip Items**:

```tsx
<div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
  <div className="text-lg">💡</div>
  <div>
    <div className="font-medium text-sm">Diversifique sua coleta</div>
    <div className="text-xs text-muted-foreground">
      Colete diferentes tipos de material para ganhar bônus XP
    </div>
  </div>
</div>

```

- **Icon**: Emoji provides visual anchor
- **Two-line text**: Title + description
- **Compact**: text-sm + text-xs saves space
- **Padded**: 12px creates comfortable reading area

**Why This Design Fits**:

- **RPG progression**: Level system matches gaming conventions
- **Visual specialization**: Each material has distinct color
- **Clear goals**: Progress bars show path to next level
- **Motivational**: Shows both current achievement and future rewards
- **Tier progression**: 5 levels creates achievable milestones
- **Educational**: Tips guide behavior without preaching
- **Scannable**: Color-coded cards allow quick comparison
- **Celebratory**: Master badges reward dedication

---
