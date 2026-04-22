"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { login } from "./actions";

export function LoginAnimations({ error }: { error?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const children = containerRef.current.children;
      if (children.length > 0) {
        animate(children, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 700,
          delay: (_el: unknown, i: number) => i * 120,
          ease: "out(3)",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      animate(errorRef.current, {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 400,
        ease: "out(3)",
      });
    }
  }, [error]);

  return (
    <div ref={containerRef} className="w-full max-w-sm p-8">
      <div className="mb-8 text-center" style={{ opacity: 0 }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Management System</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Orca Digital</h1>
      </div>

      {error && (
        <div
          ref={errorRef}
          className="mb-4 rounded border border-[#D71921]/20 bg-[#D71921]/10 p-3 text-sm text-[#D71921]"
          style={{ opacity: 0 }}
        >
          {error}
        </div>
      )}

      <form action={login} className="space-y-5" style={{ opacity: 0 }}>
        <div>
          <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full border border-foreground bg-foreground py-2.5 font-mono text-[13px] font-medium uppercase tracking-[0.06em] text-background transition hover:bg-foreground/90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
