"use client";

import { useEffect, useRef, ReactNode } from "react";
import { animate } from "animejs";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

/**
 * FadeIn component - wraps children with a fade-in animation
 * 
 * @example
 * <FadeIn delay={200} direction="up" distance={30}>
 *   <h1>Hello World</h1>
 * </FadeIn>
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 800,
  className = "",
  direction = "up",
  distance = 20,
}: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const getTranslate = () => {
        switch (direction) {
          case "up": return { translateY: [distance, 0] };
          case "down": return { translateY: [-distance, 0] };
          case "left": return { translateX: [distance, 0] };
          case "right": return { translateX: [-distance, 0] };
          default: return {};
        }
      };

      animate(elementRef.current, {
        opacity: [0, 1],
        ...getTranslate(),
        duration,
        delay,
        ease: "out(3)",
      } as any);
    }
  }, [delay, duration, direction, distance]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * StaggerContainer - animates children in sequence
 * 
 * @example
 * <StaggerContainer staggerDelay={100} direction="up">
 *   <Card />
 *   <Card />
 *   <Card />
 * </StaggerContainer>
 */
export function StaggerContainer({
  children,
  staggerDelay = 100,
  duration = 600,
  className = "",
  direction = "up",
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const children = containerRef.current.children;
      if (children.length > 0) {
        const getTranslate = () => {
          switch (direction) {
            case "up": return { translateY: [30, 0] };
            case "down": return { translateY: [-30, 0] };
            case "left": return { translateX: [30, 0] };
            case "right": return { translateX: [-30, 0] };
            default: return { translateY: [30, 0] };
          }
        };

        animate(children, {
          opacity: [0, 1],
          ...getTranslate(),
          duration,
          delay: (_el: unknown, i: number) => i * staggerDelay,
          ease: "out(3)",
        } as any);
      }
    }
  }, [staggerDelay, duration, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  scale?: [number, number];
}

/**
 * ScaleIn - scales element from small to full size with fade
 * 
 * @example
 * <ScaleIn delay={300} scale={[0.8, 1]}>
 *   <Button>Click me</Button>
 * </ScaleIn>
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 600,
  className = "",
  scale = [0.9, 1],
}: ScaleInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      animate(elementRef.current, {
        opacity: [0, 1],
        scale,
        duration,
        delay,
        ease: "outBack",
      });
    }
  }, [delay, duration, scale]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface PulseProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

/**
 * Pulse - adds a subtle pulsing animation to children
 * 
 * @example
 * <Pulse intensity={1.05}>
 *   <NotificationBadge />
 * </Pulse>
 */
export function Pulse({
  children,
  className = "",
  intensity = 1.05,
}: PulseProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      animate(elementRef.current, {
        scale: [1, intensity, 1],
        duration: 2000,
        loop: true,
        ease: "inOut(2)",
      });
    }
  }, [intensity]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

/**
 * HoverScale - scales element on hover
 * 
 * @example
 * <HoverScale scale={1.05}>
 *   <Card />
 * </HoverScale>
 */
export function HoverScale({
  children,
  className = "",
  scale = 1.05,
}: HoverScaleProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      animate(element, {
        scale,
        duration: 300,
        ease: "out(3)",
      });
    };

    const handleMouseLeave = () => {
      animate(element, {
        scale: 1,
        duration: 300,
        ease: "out(3)",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [scale]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface SlideInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  from: "left" | "right" | "top" | "bottom";
  distance?: number;
}

/**
 * SlideIn - slides element in from a direction
 * 
 * @example
 * <SlideIn from="left" distance={100} delay={200}>
 *   <Sidebar />
 * </SlideIn>
 */
export function SlideIn({
  children,
  delay = 0,
  duration = 600,
  className = "",
  from,
  distance = 100,
}: SlideInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const getInitialPosition = () => {
        switch (from) {
          case "left": return { translateX: [-distance, 0] };
          case "right": return { translateX: [distance, 0] };
          case "top": return { translateY: [-distance, 0] };
          case "bottom": return { translateY: [distance, 0] };
        }
      };

      animate(elementRef.current, {
        opacity: [0, 1],
        ...getInitialPosition(),
        duration,
        delay,
        ease: "out(3)",
      } as any);
    }
  }, [delay, duration, from, distance]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * AnimatedCounter - animates counting up to a number
 * 
 * @example
 * <AnimatedCounter value={1500} duration={2000} suffix="+" />
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  className = "",
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.round(eased * value);
      
      element.textContent = prefix + currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefix, suffix]);

  return <span ref={elementRef} className={className}>0</span>;
}
