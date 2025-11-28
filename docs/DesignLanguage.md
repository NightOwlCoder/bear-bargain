# 🐻 BearBargain Design Language

**Version 1.0** - Locked for MVP. This is your bible for consistent bear-meme vibes. No rogue neon pinks—stick to the palette or get clawed.

## 🎨 Color System

| Token | Hex | RGB | Usage | Example |
|-------|-----|-----|-------|---------|
| **Bear Primary** | `#1A5C38` | (26, 92, 56) | Success, buys, DCA buttons | "SNIPE NOW" gradient start |
| **Bear Secondary** | `#8B4513` | (139, 69, 19) | Dips, alerts, warnings | Dip splash waves, error borders |
| **Bear Gold** | `#D4AF37` | (212, 175, 55) | Profits, sells, highlights | Confetti bursts, price tags |
| **Bear Fur Dark** | `#0F172A` | (15, 23, 42) | Backgrounds, dark mode | Dashboard gradient base |
| **Bear Fur Light** | `#F8FAFC` | (248, 250, 252) | Light mode cards, text | Portfolio history rows |
| **Dip Red** | `#EF4444` | (239, 68, 68) | Negative changes (>5% down) | Change % text on dumps |
| **Moon Green** | `#4ADE80` | (74, 222, 128) | Positive changes (>5% up) | Rebound notifications |

### Color Rules
- **Gradients**: Always Bear Primary → Secondary for buttons (e.g., LinearGradient).
- **Accessibility**: Contrasts ≥4.5:1 (e.g., Gold on Fur Dark = 8.2:1).
- **Density**: No more than 3 colors per screen.

### CSS Variables (Unistyles)
```typescript
export const colors = {
  bearPrimary: '#1A5C38',
  bearSecondary: '#8B4513',
  bearGold: '#D4AF37',
  bearFurDark: '#0F172A',
  bearFurLight: '#F8FAFC',
  dipRed: '#EF4444',
  moonGreen: '#4ADE80',
  dipSplash: 'rgba(26, 92, 56, 0.3)',
} as const;
```

## 📐 Typography & Spacing

| Scale | Font Size | Weight | Line Height | Usage |
|-------|-----------|--------|-------------|-------|
| **Hero** | 32px | 900 (Black) | 40px | "BEARBARGAIN" header |
| **H1** | 24px | 800 (Extra Bold) | 28px | ETF symbols (IBIT) |
| **Body** | 16px | 600 (Semi Bold) | 24px | Prices, changes |
| **Caption** | 14px | 500 (Medium) | 20px | Alerts, timestamps |
| **Micro** | 12px | 400 (Regular) | 16px | Disclaimers, tooltips |

### Font Stack
- **Primary**: SF Pro (iOS default)
- **Fallback**: Inter
- **Button Text**: All caps ("DCA TIME!")

### Spacing Scale (8px Grid)
```typescript
export const spacing = {
  xs: 4,   // icon padding
  sm: 8,   // text gaps
  md: 16,  // card margins
  lg: 24,  // section breaks
  xl: 32,  // header padding
} as const;
```

## 🐾 Bear Motifs & Icons

| Motif | Description | Usage | Animation Tie-In |
|-------|-------------|-------|------------------|
| **Bear Paw** | Curved paw print (gold outline) | Buy buttons, tap targets | Spring bounce on press |
| **Bear Claw** | 3-claw slash (brown/red gradient) | Dip alerts, swipe gestures | Swipe animation (-100 → 0 → 50px) |
| **Bear Roar** | Open-mouthed bear head (silhouette) | Notifications, wins | Scale pulse (1 → 1.2 → 1) |
| **Salmon BTC** | Glowing fish with BTC symbol | Logo, profit icons | Wave dip on price drops |
| **Hibernation Cave** | Dark cave mouth | Offline/error states | Fade-in with "Bear Nap" text |
| **CoinGecko Logo** | Official CG logo (SVG/PNG from [brand kit](https://brand.coingecko.com/brand-kit)) | Price attribution footer/cards | Subtle pulse on load (`withSpring(1.05)`) |

### Icon Specifications
- **Source**: Custom SVGs (no emoji overload—use sparingly for flair)
- **Base Size**: 24x24px
- **Emphasis Size**: 36x36px (1.5x scale)
- **Motion**: Every icon ties to Reanimated (e.g., paw "stomps" on DCA confirm)

## ⚡ Animation Curves & Timing

| Animation Type | Duration | Easing | Reanimated Config | Trigger |
|----------------|----------|--------|-------------------|---------|
| **Stagger Fade** | 32ms/chunk | ease-in-out | `withTiming(1, {duration: 32})` | AI response streaming (word chunks) |
| **Spring Bounce** | 300ms | bouncy | `{damping: 15, mass: 1, stiffness: 120}` | Button presses, alert pops |
| **Dip Splash** | 500ms | wave | `withSpring(-20, {damping: 10})` → `withTiming(0)` | 10%+ price drop |
| **Claw Swipe** | 800ms total | sharp | Chain: `withSpring(-100)` → `withTiming(0)` → `withSpring(50)` | Dip detection |
| **Confetti Burst** | 2000ms | explosive | Custom particles (expo-particles) | Trade sim success |

### Animation Code Templates

```typescript
// Spring Bounce Config
export const springBounce = {
  damping: 15,
  mass: 1,
  stiffness: 120,
};

// Stagger Fade Config
export const staggerFade = {
  duration: 32,
  easing: Easing.inOut(Easing.ease),
};

// Dip Splash Sequence
export const dipSplash = () => {
  'worklet';
  return withSequence(
    withSpring(-20, { damping: 10 }),
    withTiming(0, { duration: 200 })
  );
};

// Claw Swipe Sequence
export const clawSwipe = () => {
  'worklet';
  return withSequence(
    withSpring(-100, { damping: 12 }),
    withTiming(0, { duration: 150 }),
    withSpring(50, { damping: 8 })
  );
};
```

### Animation Rules
- **Max Concurrent**: 5 animations (eviction pool in AnimationProvider)
- **End Triggers**: Timeout (5s default) OR user dismiss (swipe/tap)
- **Battery Optimization**: Throttle to 60fps, pause on app background

## 🎯 Usage Guidelines

### Bear Density
- 1-2 motifs per screen maximum
- Example: paw button + claw alert (not paw + claw + roar + salmon)

### Meme Balance
- Edgy text ("SNIPE THE DIP!") with clean layouts
- No visual clutter—whitespace is your friend

### Theme Modes
- **Dark Mode**: Default (crypto night owls)
- **Light Mode**: Optional
- **Auto-sync**: Follow iOS system preference

### Accessibility Requirements
- All colors pass WCAG AA (4.5:1 contrast)
- Touch targets minimum 44x44px
- VoiceOver labels on all interactive elements
- High contrast mode support

### Attribution Density (CoinGecko)
- Always pair CoinGecko logo with "Powered by CoinGecko" text
- Place in non-intrusive spots: dashboard footer, Settings > Credits
- Use Micro scale (12px) caption font for attribution text
- Hyperlink via `expo-linking` to coingecko.com (mandatory for API compliance)
- Optional UTM: `?utm_source=bearbargain&utm_medium=app`

## 🔗 Design Resources

- **Figma Kit**: Components: ButtonPaw, AlertClaw, HeaderRoar, CardETF
- **Icon Library**: `/assets/icons/` (SVG format)
- **Animation Showcase**: Storybook components for all motions

## 📈 Evolution Roadmap

- **Phase 1 (MVP)**: Core bear motifs, single theme
- **Phase 2**: User-customizable bears (polar vs grizzly themes)
- **Phase 3**: Animated mascot reactions (happy bear, sad bear, moon bear)
