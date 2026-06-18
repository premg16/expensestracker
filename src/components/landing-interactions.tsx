"use client";

import { type ReactNode, type RefObject, useEffect, useRef } from "react";

export function LandingInteractionShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLandingReveals(rootRef);
  useHeaderScroll(rootRef);
  useProblemScroll(rootRef);
  useLandingCursor(rootRef);

  return (
    <main ref={rootRef} className="landing-stage relative min-h-dvh overflow-x-hidden text-ink">
      {children}
    </main>
  );
}

function useHeaderScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = reduceMotion.matches ? 1 : Math.max(0, Math.min(1, window.scrollY / 170));

      root.style.setProperty("--nav-progress", progress.toFixed(4));
      root.dataset.navMode = progress > 0.12 ? "expanded" : "brand";
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [rootRef]);
}

function useLandingReveals(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (revealItems.length === 0) {
      return;
    }

    root.dataset.motionReady = "true";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.18,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [rootRef]);
}

function useProblemScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const section = root.querySelector<HTMLElement>("[data-problem-scroll='true']");
    const stage = section?.querySelector<HTMLElement>("[data-problem-stage]");
    if (!section || !stage) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      stage.dataset.problemStage = "step-3";
      stage.dataset.problemStep = "2";
      stage.style.setProperty("--problem-progress", "1");
      return;
    }

    let frame = 0;

    const getStage = (progress: number) => {
      if (progress < 0.08) {
        return { stageName: "prelude", step: "-1" };
      }
      if (progress < 0.22) {
        return { stageName: "intro", step: "-1" };
      }
      if (progress < 0.34) {
        return { stageName: "dock", step: "-1" };
      }
      if (progress < 0.56) {
        return { stageName: "step-1", step: "0" };
      }
      if (progress < 0.78) {
        return { stageName: "step-2", step: "1" };
      }
      return { stageName: "step-3", step: "2" };
    };

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const { stageName, step } = getStage(progress);

      stage.dataset.problemStage = stageName;
      stage.dataset.problemStep = step;
      stage.style.setProperty("--problem-progress", progress.toFixed(4));
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [rootRef]);
}

function useLandingCursor(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion.matches || !canHover.matches) {
      return;
    }

    let activeCard: HTMLElement | null = null;
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const resetCard = (card: HTMLElement) => {
      card.dataset.cursorActive = "false";
      card.style.setProperty("--cursor-x", "50%");
      card.style.setProperty("--cursor-y", "50%");
    };

    const updateFrame = () => {
      if (!lastEvent) {
        return;
      }

      const event = lastEvent;
      root.style.setProperty("--landing-cursor-x", `${event.clientX}px`);
      root.style.setProperty("--landing-cursor-y", `${event.clientY}px`);

      const target =
        event.target instanceof Element ? (event.target.closest("[data-cursor-card='true']") as HTMLElement | null) : null;

      if (!target || !root.contains(target)) {
        if (activeCard) {
          resetCard(activeCard);
          activeCard = null;
        }
        return;
      }

      if (activeCard && activeCard !== target) {
        resetCard(activeCard);
      }

      activeCard = target;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      target.dataset.cursorActive = "true";
      target.style.setProperty("--cursor-x", `${x * 100}%`);
      target.style.setProperty("--cursor-y", `${y * 100}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      lastEvent = event;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateFrame);
    };

    const onPointerLeave = () => {
      window.cancelAnimationFrame(frame);
      lastEvent = null;
      root.style.setProperty("--landing-cursor-x", "50vw");
      root.style.setProperty("--landing-cursor-y", "40vh");

      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [rootRef]);
}
