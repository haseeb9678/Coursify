"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover]';

export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  // Raw pointer position (zero React re-renders on move)
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth spring for the trailing outer ring
  const ringX = useSpring(rawX, {
    stiffness: 420,
    damping: 32,
    mass: 0.45,
  });
  const ringY = useSpring(rawY, {
    stiffness: 420,
    damping: 32,
    mass: 0.45,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const updatePointerCapability = () => {
      setHasFinePointer(mediaQuery.matches);
    };

    updatePointerCapability();
    mediaQuery.addEventListener("change", updatePointerCapability);

    if (!mediaQuery.matches) {
      return () => {
        mediaQuery.removeEventListener("change", updatePointerCapability);
      };
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      rawX.set(event.clientX);
      rawY.set(event.clientY);
      setIsVisible(true);

      const target = event.target as HTMLElement | null;
      const hoveringInteractive = !!target?.closest(INTERACTIVE_SELECTOR);
      setIsHovering((prev) =>
        prev === hoveringInteractive ? prev : hoveringInteractive,
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setIsPressed(true);
    };

    const handlePointerUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      mediaQuery.removeEventListener("change", updatePointerCapability);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [rawX, rawY]);

  if (shouldReduceMotion || !hasFinePointer) return null;

  const ringSize = isHovering ? 44 : 32;
  const ringOffset = -ringSize / 2;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] hidden overflow-hidden md:block"
    >
      {/* Smooth Trailing Outer Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: ringOffset,
          translateY: ringOffset,
          willChange: "transform",
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          scale: isPressed ? 0.86 : 1,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isHovering
            ? "rgba(37, 99, 235, 0.14)"
            : "rgba(37, 99, 235, 0.03)",
          borderColor: isHovering
            ? "rgba(37, 99, 235, 0.9)"
            : "rgba(37, 99, 235, 0.55)",
        }}
        transition={{
          width: { type: "spring", stiffness: 360, damping: 26 },
          height: { type: "spring", stiffness: 360, damping: 26 },
          scale: { duration: 0.12, ease: "easeOut" },
          opacity: { duration: 0.18 },
          backgroundColor: { duration: 0.18 },
          borderColor: { duration: 0.18 },
        }}
        className="absolute top-0 left-0 rounded-full border backdrop-blur-[1px]"
      />

      {/* Instant Center Dot (Zero Lag) */}
      <motion.div
        style={{
          x: rawX,
          y: rawY,
          translateX: -3,
          translateY: -3,
          willChange: "transform",
        }}
        animate={{
          scale: isPressed ? 0.75 : isHovering ? 1.25 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.12, ease: "easeOut" },
          opacity: { duration: 0.15 },
        }}
        className="absolute top-0 left-0 size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.65)]"
      />
    </div>
  );
}