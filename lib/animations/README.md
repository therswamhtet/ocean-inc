# Anime.js Animation System

This project uses [anime.js v4](https://animejs.com/) for smooth, performant animations.

## Installation

```bash
npm install animejs
npm install --save-dev @types/animejs
```

## Quick Start

### 1. Pre-built Animation Components

Import and use ready-made animation wrappers:

```tsx
import { FadeIn, StaggerContainer, HoverScale, Pulse } from "@/lib/animations";

// Fade in from a direction
<FadeIn direction="up" delay={200} duration={600}>
  <YourComponent />
</FadeIn>

// Stagger children animations
<StaggerContainer staggerDelay={100} direction="up">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</StaggerContainer>

// Hover scale effect
<HoverScale scale={1.05}>
  <Button>Hover me</Button>
</HoverScale>

// Pulsing animation
<Pulse intensity={1.1}>
  <Badge>New</Badge>
</Pulse>
```

### 2. useAnime Hook

For interactive animations with full control:

```tsx
import { useAnime } from "@/lib/animations";

function MyComponent() {
  const { ref, play, pause, restart, reverse } = useAnime({
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#3b82f6",
    duration: 1000,
    ease: "inOut(2)",
    autoplay: false, // Don't start automatically
  });

  return (
    <>
      <div ref={ref} className="w-20 h-20 bg-red-500 rounded" />
      <button onClick={play}>Play</button>
      <button onClick={reverse}>Reverse</button>
    </>
  );
}
```

### 3. Direct anime.js v4 Usage

For complex animations, use anime.js directly:

```tsx
import { animate } from "animejs";

// Animate a single element
animate('.my-element', {
  translateX: 250,
  rotate: '1turn',
  duration: 1000,
  ease: 'out(3)',
});

// Animate multiple elements with stagger
animate('.my-elements', {
  translateY: [30, 0],
  opacity: [0, 1],
  delay: (el, i) => i * 100,
  duration: 600,
});

// Create a timeline
import { createTimeline } from "animejs";

const tl = createTimeline({ defaults: { duration: 600 } });
tl.add(el1, { translateX: 250 })
  .add(el2, { translateX: 250 }, "-=200"); // Overlap by 200ms
```

## Available Components

| Component | Props | Description |
|-----------|-------|-------------|
| `FadeIn` | `direction`, `delay`, `duration`, `distance` | Fade in from a direction |
| `StaggerContainer` | `staggerDelay`, `duration`, `direction` | Animate children in sequence |
| `ScaleIn` | `delay`, `duration`, `scale` | Scale up with fade |
| `Pulse` | `intensity` | Continuous pulsing animation |
| `HoverScale` | `scale` | Scale on hover |
| `SlideIn` | `from`, `distance`, `delay` | Slide from a direction |
| `AnimatedCounter` | `value`, `duration`, `prefix`, `suffix` | Count up animation |

## Available Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useAnime(options, deps)` | `{ ref, play, pause, restart, reverse }` | Controlled animation |
| `useStagger(options, deps)` | `{ containerRef }` | Stagger children animations |
| `useScrollAnimation(options, threshold)` | `{ ref }` | Trigger on scroll into view |

## Easing Functions (v4)

anime.js v4 uses a simplified easing syntax:

```tsx
// Basic
"linear"

// Power easings - the number controls the strength
"in(2)"     // Quad
"in(3)"     // Cubic
"in(4)"     // Quart
"out(2)"    // Quad out
"out(3)"    // Cubic out
"inOut(2)"  // Quad in-out
"inOut(3)"  // Cubic in-out

// Named easings
"inSine", "outSine", "inOutSine"
"inExpo", "outExpo", "inOutExpo"
"inCirc", "outCirc", "inOutCirc"
"inBack", "outBack", "inOutBack"
"outElastic", "inOutElastic"
"outBounce", "inOutBounce"
```

## Staggers

```tsx
import { stagger } from "animejs";

// Simple stagger
delay: (el, i) => i * 100

// Using stagger helper
delay: stagger(100)

// Stagger from center
delay: stagger(100, { from: "center" })

// Stagger from last
delay: stagger(100, { from: "last" })
```

## Examples

### Page Load Animation

```tsx
import { FadeIn, StaggerContainer } from "@/lib/animations";

export default function Page() {
  return (
    <StaggerContainer staggerDelay={100} className="space-y-4">
      <FadeIn direction="down">
        <Header />
      </FadeIn>
      <FadeIn direction="up" delay={100}>
        <Content />
      </FadeIn>
      <FadeIn direction="up" delay={200}>
        <Footer />
      </FadeIn>
    </StaggerContainer>
  );
}
```

### List Animation

```tsx
import { StaggerContainer, HoverScale } from "@/lib/animations";

<StaggerContainer 
  staggerDelay={50} 
  direction="up"
  className="grid grid-cols-3 gap-4"
>
  {items.map((item) => (
    <HoverScale key={item.id} scale={1.03}>
      <Card>{item.name}</Card>
    </HoverScale>
  ))}
</StaggerContainer>
```

### Modal/Dialog Animation

```tsx
import { FadeIn, ScaleIn } from "@/lib/animations";

<Dialog>
  <FadeIn duration={300}>
    <DialogOverlay />
  </FadeIn>
  <ScaleIn delay={100} scale={[0.95, 1]}>
    <DialogContent>
      {/* Content */}
    </DialogContent>
  </ScaleIn>
</Dialog>
```

### Button Click Feedback

```tsx
import { animate } from "animejs";

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  animate(e.currentTarget, {
    scale: [1, 1.2, 1],
    duration: 300,
    ease: "out(3)",
  });
  // ... rest of handler
}
```

### Counter Animation

```tsx
import { AnimatedCounter } from "@/lib/animations";

<Card>
  <AnimatedCounter value={1500} suffix="+" duration={2000} />
  <p>Projects Completed</p>
</Card>
```

## Demo Page

Visit `/animation-examples` to see all animations in action and get copy-paste ready code.

## Resources

- [Anime.js v4 Documentation](https://animejs.com/documentation/)
- [Anime.js GitHub](https://github.com/juliangarnier/anime)
