"use client";

import { Accessibility } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useAccessibilityPanel } from "./AccessibilityProvider";

type AccessibilityButtonProps =
  | {
      variant: "floating";
    }
  | {
      variant: "sidebar";
      collapsed?: boolean;
      onOpen?: () => void;
    };

export default function AccessibilityButton(
  props: AccessibilityButtonProps,
) {
  const { openPanel } = useAccessibilityPanel();

  if (props.variant === "floating") {
    return (
      <Button
        type="button"
        size="icon-lg"
        variant="default"
        aria-label="Open accessibility preferences"
        title="Accessibility preferences"
        onClick={openPanel}
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 size-12 rounded-full shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transform-none sm:right-6 sm:bottom-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <Accessibility aria-hidden="true" className="size-5" />
      </Button>
    );
  }

  const collapsed = props.collapsed ?? false;
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      aria-label="Open accessibility preferences"
      onClick={() => {
        props.onOpen?.();
        openPanel();
      }}
      className={cn(
        "h-11 w-full justify-start gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed && "size-11 justify-center px-0",
      )}
    >
      <Accessibility aria-hidden="true" className="size-5 shrink-0" />
      {!collapsed && <span>Accessibility</span>}
    </Button>
  );

  if (!collapsed) return trigger;

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent side="right">Accessibility preferences</TooltipContent>
    </Tooltip>
  );
}
