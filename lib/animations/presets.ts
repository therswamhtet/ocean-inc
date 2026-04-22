/**
 * Predefined animation presets for common use cases
 * Use these with anime() or the useAnime hook
 */

export const presets = {
  /**
   * Fade in from bottom
   * Good for: Cards, list items, content sections
   */
  fadeInUp: {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 600,
    ease: "out(3)", // cubic bezier approximation
  },

  /**
   * Fade in from top
   * Good for: Headers, navigation items
   */
  fadeInDown: {
    opacity: [0, 1],
    translateY: [-30, 0],
    duration: 600,
    ease: "out(3)",
  },

  /**
   * Fade in from left
   * Good for: Sidebars, side content
   */
  fadeInLeft: {
    opacity: [0, 1],
    translateX: [-50, 0],
    duration: 600,
    ease: "out(3)",
  },

  /**
   * Fade in from right
   * Good for: Sidebars, side content
   */
  fadeInRight: {
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 600,
    ease: "out(3)",
  },

  /**
   * Scale in with bounce
   * Good for: Buttons, badges, notifications
   */
  scaleIn: {
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 500,
    ease: "outBack",
  },

  /**
   * Pop effect
   * Good for: Success states, likes, notifications
   */
  pop: {
    scale: [1, 1.2, 1],
    duration: 300,
    ease: "out(3)",
  },

  /**
   * Shake effect
   * Good for: Error states, validation failures
   */
  shake: {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 500,
    ease: "inOut(2)",
  },

  /**
   * Pulse effect
   * Good for: Attention indicators, live status
   */
  pulse: {
    scale: [1, 1.1, 1],
    duration: 1500,
    loop: true,
    ease: "inOut(2)",
  },

  /**
   * Flip in
   * Good for: Cards revealing content
   */
  flipIn: {
    opacity: [0, 1],
    rotateY: [-90, 0],
    duration: 800,
    ease: "out(3)",
  },

  /**
   * Rotate in
   * Good for: Icons, loading states
   */
  rotateIn: {
    opacity: [0, 1],
    rotate: [-180, 0],
    duration: 600,
    ease: "out(3)",
  },

  /**
   * Elastic scale
   * Good for: Playful UI elements
   */
  elastic: {
    scale: [0, 1],
    duration: 1000,
    ease: "outElastic(1, .5)",
  },
} as const;

/**
 * Stagger delay generators
 * Returns a function that calculates delay based on index
 */
export const staggers = {
  fast: (index: number) => index * 50,
  normal: (index: number) => index * 100,
  slow: (index: number) => index * 150,
  cascade: (index: number) => index * 100,
  reverse: (index: number, total: number) => (total - 1 - index) * 100,
  center: (index: number, total: number) => {
    const center = Math.floor(total / 2);
    return Math.abs(index - center) * 100;
  },
};

/**
 * Easing functions reference for anime.js v4
 * Using the new ease(in|out|inOut)(amount) format
 */
export const easings = {
  // Basic
  linear: "linear",
  
  // In
  inQuad: "in(2)",
  inCubic: "in(3)",
  inQuart: "in(4)",
  inQuint: "in(5)",
  inSine: "inSine",
  inExpo: "inExpo",
  inCirc: "inCirc",
  inBack: "inBack",
  
  // Out
  outQuad: "out(2)",
  outCubic: "out(3)",
  outQuart: "out(4)",
  outQuint: "out(5)",
  outSine: "outSine",
  outExpo: "outExpo",
  outCirc: "outCirc",
  outBack: "outBack",
  
  // In-Out
  inOutQuad: "inOut(2)",
  inOutCubic: "inOut(3)",
  inOutQuart: "inOut(4)",
  inOutQuint: "inOut(5)",
  inOutSine: "inOutSine",
  inOutExpo: "inOutExpo",
  inOutCirc: "inOutCirc",
  inOutBack: "inOutBack",
  
  // Special
  outElastic: (amplitude: number, period: number) => 
    `outElastic(${amplitude}, ${period})`,
  inOutElastic: (amplitude: number, period: number) => 
    `inOutElastic(${amplitude}, ${period})`,
  outBounce: "outBounce",
  inOutBounce: "inOutBounce",
} as const;

/**
 * Create a timeline function that chains animations
 * Note: anime.js v4 uses a different approach than v3
 */
export function createTimeline(defaults?: Record<string, unknown>) {
  return {
    animations: [] as Array<Record<string, unknown>>,
    add(params: Record<string, unknown>, offset?: string | number) {
      this.animations.push({ ...defaults, ...params, offset });
      return this;
    },
  };
}

/**
 * Helper to animate a value change
 * Note: This uses a simple approach compatible with anime.js v4
 */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  ease = "out(3)"
) {
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Simple easeOutCubic implementation
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = from + (to - from) * eased;
    
    onUpdate(Math.round(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}
