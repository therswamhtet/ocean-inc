"use client";

import { useEffect, useRef, useCallback } from "react";
import { animate, type AnimationParams } from "animejs";

// Type for anime.js v4 animation instance
interface AnimeInstance {
  play: () => void;
  pause: () => void;
  restart: () => void;
  reverse: () => void;
  cancel: () => void;
}

/**
 * Custom hook for anime.js animations in React components
 * 
 * Usage:
 * const { ref, play, pause, restart } = useAnime({
 *   translateX: 250,
 *   duration: 800,
 *   ease: 'out(2)'
 * });
 */
export function useAnime(
  options: Omit<AnimationParams, 'targets'>,
  deps: React.DependencyList = []
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimeInstance | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      const params = { ...options };
      if (!('autoplay' in params)) {
        (params as Record<string, unknown>).autoplay = true;
      }
      animationRef.current = animate(elementRef.current, params as AnimationParams);
    }

    return () => {
      // Clean up animation on unmount
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const play = useCallback(() => animationRef.current?.play(), []);
  const pause = useCallback(() => animationRef.current?.pause(), []);
  const restart = useCallback(() => animationRef.current?.restart(), []);
  const reverse = useCallback(() => animationRef.current?.reverse(), []);

  return { ref: elementRef, play, pause, restart, reverse, animation: animationRef };
}

/**
 * Hook for staggered animations on multiple elements
 * 
 * Usage:
 * const { containerRef } = useStagger({
 *   translateY: [20, 0],
 *   opacity: [0, 1],
 *   delay: (el, i) => i * 100
 * });
 */
export function useStagger(
  options: Omit<AnimationParams, 'targets'>,
  deps: React.DependencyList = []
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimeInstance | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const children = containerRef.current.children;
      if (children.length > 0) {
        const params = { ...options };
        if (!('autoplay' in params)) {
          (params as Record<string, unknown>).autoplay = true;
        }
        animationRef.current = animate(children, params as AnimationParams);
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, animation: animationRef };
}

/**
 * Hook for scroll-triggered animations
 * 
 * Usage:
 * const { ref } = useScrollAnimation({
 *   translateY: [50, 0],
 *   opacity: [0, 1],
 *   duration: 800
 * });
 */
export function useScrollAnimation(
  options: Omit<AnimationParams, 'targets' | 'autoplay'>,
  threshold = 0.1
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animate(element, {
              autoplay: true,
              ...options,
            } as AnimationParams);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options, threshold]);

  return { ref: elementRef };
}

export { animate, type AnimationParams };
