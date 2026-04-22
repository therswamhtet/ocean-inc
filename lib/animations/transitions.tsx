"use client";

import { useEffect, useRef, ReactNode } from "react";
import { animate } from "animejs";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition - wraps page content with a fade-in animation
 * Use this in layout files or page wrappers for smooth page transitions
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (ref.current && !hasAnimated.current) {
      hasAnimated.current = true;
      // Set initial state before animating
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(15px)';
      
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 500,
        ease: "out(3)",
      });
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * StaggerList - animates list items with stagger effect
 * Best for: grids, lists, cards
 */
export function StaggerList({
  children,
  className = "",
  staggerDelay = 80,
  direction = "up",
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const children = ref.current.children;
      if (children.length > 0) {
        const params: Record<string, unknown> = {
          opacity: [0, 1],
          duration: 500,
          delay: (_el: unknown, i: number) => i * staggerDelay,
          ease: "out(3)",
        };

        switch (direction) {
          case "up": params.translateY = [25, 0]; break;
          case "down": params.translateY = [-25, 0]; break;
          case "left": params.translateX = [25, 0]; break;
          case "right": params.translateX = [-25, 0]; break;
        }

        animate(children, params as any);
      }
    }
  }, [staggerDelay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

/**
 * FadeInSection - fade in wrapper for page sections
 */
export function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 20,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const params: Record<string, unknown> = {
        opacity: [0, 1],
        duration: 600,
        delay,
        ease: "out(3)",
      };

      switch (direction) {
        case "up": params.translateY = [distance, 0]; break;
        case "down": params.translateY = [-distance, 0]; break;
        case "left": params.translateX = [distance, 0]; break;
        case "right": params.translateX = [-distance, 0]; break;
      }

      animate(ref.current, params as any);
    }
  }, [delay, direction, distance]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface AnimatedMetricProps {
  value: number;
  className?: string;
  duration?: number;
}

/**
 * AnimatedMetric - counts up to a number on mount
 */
export function AnimatedMetric({ value, className = "", duration = 1500 }: AnimatedMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.round(eased * value);
      
      element.textContent = String(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value, duration]);

  return <span ref={ref} className={className}>0</span>;
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

/**
 * HoverLift - lifts element up on hover
 */
export function HoverLift({ children, className = "", y = -4 }: HoverLiftProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      animate(element, {
        translateY: y,
        duration: 250,
        ease: "out(3)",
      });
    };

    const handleMouseLeave = () => {
      animate(element, {
        translateY: 0,
        duration: 250,
        ease: "out(3)",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

/**
 * ScaleOnHover - scales element on hover with shadow
 */
export function ScaleOnHover({ children, className = "", scale = 1.02 }: ScaleOnHoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      animate(element, {
        scale,
        duration: 200,
        ease: "out(3)",
      });
    };

    const handleMouseLeave = () => {
      animate(element, {
        scale: 1,
        duration: 200,
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
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
