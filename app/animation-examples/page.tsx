"use client";

import {
  FadeIn,
  StaggerContainer,
  ScaleIn,
  Pulse,
  HoverScale,
  SlideIn,
  AnimatedCounter,
  useAnime,
} from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

/**
 * Animation Examples Page
 * 
 * This page demonstrates various ways to use anime.js in your project.
 * You can use these patterns throughout your application.
 */

export default function AnimationExamples() {
  // Example of using the useAnime hook for interactive animations
  const { ref: boxRef, play, reverse } = useAnime({
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#3b82f6",
    duration: 1000,
    ease: "inOut(2)",
    autoplay: false,
  });

  return (
    <div className="container mx-auto py-12 px-4 space-y-16">
      <FadeIn direction="up">
        <h1 className="text-4xl font-bold text-center mb-4">
          Animation Examples
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Demonstrating anime.js integration with React components
        </p>
      </FadeIn>

      {/* Fade In Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Fade In Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FadeIn direction="up" delay={0}>
            <Card>
              <CardContent className="p-6 text-center">Fade Up</CardContent>
            </Card>
          </FadeIn>
          <FadeIn direction="down" delay={100}>
            <Card>
              <CardContent className="p-6 text-center">Fade Down</CardContent>
            </Card>
          </FadeIn>
          <FadeIn direction="left" delay={200}>
            <Card>
              <CardContent className="p-6 text-center">Fade Left</CardContent>
            </Card>
          </FadeIn>
          <FadeIn direction="right" delay={300}>
            <Card>
              <CardContent className="p-6 text-center">Fade Right</CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Stagger Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Stagger Animation</h2>
        <StaggerContainer staggerDelay={100} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">Item {i}</CardContent>
            </Card>
          ))}
        </StaggerContainer>
      </section>

      {/* Scale In */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Scale In Animation</h2>
        <div className="flex gap-4 justify-center">
          <ScaleIn delay={0}>
            <Card className="w-32 h-32 flex items-center justify-center">
              <span>Scale 1</span>
            </Card>
          </ScaleIn>
          <ScaleIn delay={150} scale={[0.5, 1]}>
            <Card className="w-32 h-32 flex items-center justify-center">
              <span>Scale 2</span>
            </Card>
          </ScaleIn>
          <ScaleIn delay={300}>
            <Card className="w-32 h-32 flex items-center justify-center">
              <span>Scale 3</span>
            </Card>
          </ScaleIn>
        </div>
      </section>

      {/* Hover Effects */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Hover Animations</h2>
        <div className="flex gap-6 justify-center">
          <HoverScale scale={1.05}>
            <Button size="lg">Hover to Scale</Button>
          </HoverScale>
          <HoverScale scale={1.1}>
            <Card className="w-40 h-20 flex items-center justify-center cursor-pointer">
              Hover Card
            </Card>
          </HoverScale>
        </div>
      </section>

      {/* Pulse Effect */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Pulse Animation</h2>
        <div className="flex gap-8 justify-center">
          <Pulse intensity={1.1}>
            <div className="w-16 h-16 bg-[#D4A843] rounded-full flex items-center justify-center text-white font-bold">
              New
            </div>
          </Pulse>
          <Pulse intensity={1.05}>
            <Button variant="destructive" size="lg">
              Notification
            </Button>
          </Pulse>
        </div>
      </section>

      {/* Slide In */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Slide In Animations</h2>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <SlideIn from="left" delay={0}>
            <Card>
              <CardContent className="p-4">Slide from Left</CardContent>
            </Card>
          </SlideIn>
          <SlideIn from="right" delay={100}>
            <Card>
              <CardContent className="p-4">Slide from Right</CardContent>
            </Card>
          </SlideIn>
        </div>
      </section>

      {/* Animated Counter */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Animated Counter</h2>
        <div className="flex gap-8 justify-center">
          <Card className="p-6 text-center">
            <CardTitle className="text-4xl font-bold text-[#D4A843]">
              <AnimatedCounter value={1500} suffix="+" />
            </CardTitle>
            <p className="text-muted-foreground mt-2">Projects Completed</p>
          </Card>
          <Card className="p-6 text-center">
            <CardTitle className="text-4xl font-bold text-[#4A9E5C]">
              <AnimatedCounter value={98} suffix="%" />
            </CardTitle>
            <p className="text-muted-foreground mt-2">Client Satisfaction</p>
          </Card>
        </div>
      </section>

      {/* Interactive Animation with useAnime Hook */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Interactive Animation (useAnime Hook)</h2>
        <div className="bg-surface-raised rounded-lg p-8">
          <div className="h-32 flex items-center">
            <div
              ref={boxRef}
              className="w-20 h-20 bg-[#D71921] rounded-lg"
            />
          </div>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={play}>Play Animation</Button>
            <Button variant="outline" onClick={reverse}>
              Reverse
            </Button>
          </div>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How to Use</h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <pre className="bg-surface-raised p-4 rounded-lg text-sm overflow-x-auto">
{`// Import components
import { FadeIn, StaggerContainer, useAnime } from "@/lib/animations";

// Use pre-built components
<FadeIn direction="up" delay={200}>
  <YourComponent />
</FadeIn>

// Use stagger for lists
<StaggerContainer staggerDelay={100}>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</StaggerContainer>

// Use hook for interactive animations
const { ref, play, pause, reverse } = useAnime({
  translateX: 250,
  rotate: "1turn",
  duration: 1000,
  autoplay: false,
});

// Or use anime.js directly
import { anime, presets } from "animejs";

anime('.my-element', {
  ...presets.fadeInUp,
  delay: (el, i) => i * 100,
});`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
