"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { SidebarContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardScrollAreaProps {
  children: ReactNode;
  className?: string;
}

interface DragState {
  pointerStart: number;
  scrollStart: number;
  scrollRange: number;
  thumbRange: number;
}

const MIN_THUMB_HEIGHT = 45;
const MAX_THUMB_HEIGHT = 52;

export default function DashboardScrollArea({
  children,
  className,
}: DashboardScrollAreaProps) {
  const scrollAreaId = useId();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!scrollArea || !track || !thumb) return;

    const updateThumb = () => {
      const scrollRange = scrollArea.scrollHeight - scrollArea.clientHeight;
      const isScrollable = scrollRange > 1;
      track.style.display = isScrollable ? "flex" : "none";

      if (!isScrollable) return;

      const rawThumbHeight =
        (scrollArea.clientHeight * scrollArea.clientHeight) /
        scrollArea.scrollHeight;
      const thumbHeight = Math.min(
        MAX_THUMB_HEIGHT,
        Math.max(MIN_THUMB_HEIGHT, rawThumbHeight),
      );
      const thumbRange = Math.max(
        0,
        scrollArea.clientHeight - thumbHeight,
      );
      const thumbTop =
        (scrollArea.scrollTop / scrollRange) * thumbRange;

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
      thumb.setAttribute("aria-valuemax", String(scrollRange));
      thumb.setAttribute(
        "aria-valuenow",
        String(Math.round(scrollArea.scrollTop)),
      );
      thumb.setAttribute(
        "aria-valuetext",
        `${Math.round((scrollArea.scrollTop / scrollRange) * 100)}%`,
      );
    };

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(scrollArea);
    Array.from(scrollArea.children).forEach((child) =>
      resizeObserver.observe(child),
    );
    scrollArea.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);
    updateThumb();

    return () => {
      resizeObserver.disconnect();
      scrollArea.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const scrollRange = scrollArea.scrollHeight - scrollArea.clientHeight;
    const thumbRange = scrollArea.clientHeight - event.currentTarget.clientHeight;
    if (scrollRange <= 0 || thumbRange <= 0) return;

    event.preventDefault();
    dragStateRef.current = {
      pointerStart: event.clientY,
      scrollStart: scrollArea.scrollTop,
      scrollRange,
      thumbRange,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const scrollArea = scrollAreaRef.current;
    if (!dragState || !scrollArea) return;

    scrollArea.scrollTop =
      dragState.scrollStart +
      ((event.clientY - dragState.pointerStart) * dragState.scrollRange) /
        dragState.thumbRange;
  };

  const handlePointerEnd = () => {
    dragStateRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const pageStep = scrollArea.clientHeight * 0.9;
    switch (event.key) {
      case "ArrowDown":
        scrollArea.scrollTop += 40;
        break;
      case "ArrowUp":
        scrollArea.scrollTop -= 40;
        break;
      case "PageDown":
        scrollArea.scrollTop += pageStep;
        break;
      case "PageUp":
        scrollArea.scrollTop -= pageStep;
        break;
      case "Home":
        scrollArea.scrollTop = 0;
        break;
      case "End":
        scrollArea.scrollTop = scrollArea.scrollHeight;
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  return (
    <div className="group/scroll-area relative flex min-h-0 flex-1 flex-col">
      <SidebarContent
        ref={scrollAreaRef}
        id={scrollAreaId}
        className={cn("dashboard-sidebar-scroll min-h-0 flex-1", className)}
      >
        {children}
      </SidebarContent>

      <div
        ref={trackRef}
        className="dashboard-scrollbar-track pointer-events-none absolute inset-y-0 right-0 z-10 w-3 justify-center opacity-0 transition-opacity duration-150 group-hover/scroll-area:opacity-100 group-focus-within/scroll-area:opacity-100"
      >
        <div
          ref={thumbRef}
          role="scrollbar"
          aria-label="Sidebar navigation"
          aria-controls={scrollAreaId}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={0}
          aria-valuenow={0}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onLostPointerCapture={handlePointerEnd}
          className="dashboard-scrollbar-thumb pointer-events-auto absolute right-1 top-0 w-1.5 touch-none rounded-full bg-primary/35 transition-colors hover:bg-primary/60 focus-visible:bg-primary/70 focus-visible:outline-none active:cursor-grabbing"
        />
      </div>
    </div>
  );
}
