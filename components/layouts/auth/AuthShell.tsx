"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";
import { CheckCircle2, GraduationCap } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared stagger variants (used by the forms inside the card)         */
/* ------------------------------------------------------------------ */

export const formContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
};

export const formItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/* Flip context: lets any link flip the card out before navigating     */
/* ------------------------------------------------------------------ */

type FlipContextValue = { flipTo: (href: string) => void };

const FlipContext = createContext<FlipContextValue>({ flipTo: () => {} });

export const useAuthFlip = () => useContext(FlipContext);

export function FlipLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { flipTo } = useAuthFlip();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        // Let the browser handle new-tab / modified clicks normally
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        flipTo(href);
      }}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

type AuthShellProps = {
  mode: "login" | "signup";
  panelTitle: string;
  panelPoints: string[];
  children: ReactNode;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

export function AuthShell({
  mode,
  panelTitle,
  panelPoints,
  children,
}: AuthShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useAccessibleMotion();
  const [leaving, setLeaving] = useState(false);
  const nextHref = useRef<string | null>(null);
  const hasNavigated = useRef(false);

  // Signup turns away to the left, login arrives from the right (and back),
  // so the card feels like one page being turned.
  const edge = mode === "signup" ? -90 : 90;
  const otherRoute = mode === "signup" ? "/login" : "/signup";
  const ownRoute = mode === "signup" ? "/signup" : "/login";

  // Reset whenever this page is shown again (back button, cached or
  // kept-alive page) so a stale "leaving" state can never re-trigger a push
  useEffect(() => {
    
    if (pathname === ownRoute) {
      (() => {
        nextHref.current = null;
        hasNavigated.current = false;
        setLeaving(false);
        
      })()
    }
  }, [pathname, ownRoute]);

  // Warm up the other page (works in production builds)
  useEffect(() => {
    router.prefetch(otherRoute);
  }, [router, otherRoute]);

  // Start the flip-out; navigation happens when it finishes
  const flipTo = useCallback((href: string) => {
    if (nextHref.current) return;
    nextHref.current = href;
    setLeaving(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <FlipContext.Provider value={{ flipTo }}>
        <section className="relative flex min-h-dvh items-center bg-background text-foreground
        justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
          {/* Soft background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px]
             -translate-x-1/2 rounded-full bg-primary/15 blur-[110px] sm:h-[560px] sm:w-[560px]"
          />

          {/* Perspective wrapper gives the flip its depth */}
          <div className="relative z-10 w-full max-w-md [perspective:1800px] lg:max-w-4xl">
            <motion.div
              initial={{ rotateY: edge, opacity: 0 }}
              animate={
                leaving
                  ? {
                      rotateY: reduceMotion ? 0 : edge,
                      opacity: 0,
                      transition: {
                        duration: reduceMotion ? 0.15 : 0.45,
                        ease: EASE_IN,
                      },
                    }
                  : {
                      rotateY: 0,
                      opacity: 1,
                      transition: { duration: 0.7, ease: EASE_OUT },
                    }
              }
              onAnimationComplete={() => {
                if (
                  !leaving ||
                  !nextHref.current ||
                  hasNavigated.current ||
                  pathname !== ownRoute
                ) {
                  return;
                }
                hasNavigated.current = true;
                router.push(nextHref.current);
              }}
              style={{ transformOrigin: "center center" }}
              className="grid overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl shadow-primary/10
               ring-1 ring-primary/10 transition-colors duration-300 will-change-transform lg:grid-cols-[1fr_1.1fr]" 
            >
              {/* LEFT: light brand panel (desktop only) */}
              <aside className="relative hidden flex-col justify-between overflow-hidden 
              bg-gradient-to-br from-brand-soft via-background to-card p-10 lg:flex">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-primary/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-brand-accent/10"
                />

                <Link
                  href="/"
                  className="relative flex items-center gap-2 text-lg font-bold tracking-tight text-brand-text"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  Coursify
                </Link>

                <div className="relative space-y-6">
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-text xl:text-4xl">
                    {panelTitle}
                  </h2>

                  <ul className="space-y-3">
                    {panelPoints.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-3 text-sm text-brand-text-muted"
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* RIGHT: form area */}
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                {/* Mobile brand */}
                <Link
                  href="/"
                  className="mb-6 flex items-center gap-2 text-lg font-bold tracking-tight text-brand-text lg:hidden"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  Coursify
                </Link>

                {children}
              </div>
            </motion.div>
          </div>
        </section>
      </FlipContext.Provider>
    </MotionConfig>
  );
}