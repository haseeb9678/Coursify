"use client";

import {
  Contrast,
  Focus,
  Link2,
  MoveHorizontal,
  Type,
  Waves,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAccessibilityStore } from "@/features/accessibility/store/accessibility.store";

import AccessibilityOption from "./AccessibilityOption";
import AccessibilityResetButton from "./AccessibilityResetButton";
import FontSizeControl from "./FontSizeControl";

export default function AccessibilityPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const highContrast = useAccessibilityStore((state) => state.highContrast);
  const textSpacing = useAccessibilityStore((state) => state.textSpacing);
  const highlightLinks = useAccessibilityStore(
    (state) => state.highlightLinks,
  );
  const reduceMotion = useAccessibilityStore((state) => state.reduceMotion);
  const readableFont = useAccessibilityStore((state) => state.readableFont);
  const enhancedFocus = useAccessibilityStore(
    (state) => state.enhancedFocus,
  );
  const toggleHighContrast = useAccessibilityStore(
    (state) => state.toggleHighContrast,
  );
  const toggleTextSpacing = useAccessibilityStore(
    (state) => state.toggleTextSpacing,
  );
  const toggleHighlightLinks = useAccessibilityStore(
    (state) => state.toggleHighlightLinks,
  );
  const toggleReduceMotion = useAccessibilityStore(
    (state) => state.toggleReduceMotion,
  );
  const toggleReadableFont = useAccessibilityStore(
    (state) => state.toggleReadableFont,
  );
  const toggleEnhancedFocus = useAccessibilityStore(
    (state) => state.toggleEnhancedFocus,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-full max-w-[min(100vw,28rem)] gap-0 overflow-x-clip border-l border-border p-0"
      >
        <SheetHeader className="shrink-0 border-b border-border p-[16px] pr-[64px]">
          <div className="flex w-full min-w-0 flex-col items-start gap-[8px] sm:flex-row sm:gap-3">
            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Waves aria-hidden="true" className="size-[20px]" />
            </span>
            <div className="w-full min-w-0">
              <SheetTitle className="text-base font-semibold">
                Accessibility Preferences
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm">
                Customize your browsing experience.
              </SheetDescription>
            </div>
          </div>
          <SheetClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close accessibility preferences"
                className="absolute right-4 top-4"
              />
            }
          >
            <X aria-hidden="true" />
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-[20px] overflow-y-auto p-[16px]">
          <FontSizeControl />

          <section aria-labelledby="accessibility-options">
            <h3
              id="accessibility-options"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              Display and interaction
            </h3>
            <div className="space-y-2.5">
              <AccessibilityOption
                icon={Contrast}
                title="High contrast"
                description="Strengthen text, surface, border, and control contrast."
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
              />
              <AccessibilityOption
                icon={MoveHorizontal}
                title="Text spacing"
                description="Increase spacing between letters, words, lines, and paragraphs."
                checked={textSpacing}
                onCheckedChange={toggleTextSpacing}
              />
              <AccessibilityOption
                icon={Link2}
                title="Highlight links"
                description="Underline links and make them easier to distinguish."
                checked={highlightLinks}
                onCheckedChange={toggleHighlightLinks}
              />
              <AccessibilityOption
                icon={Waves}
                title="Reduce motion"
                description="Reduce nonessential motion. Your device preference is also respected."
                checked={reduceMotion}
                onCheckedChange={toggleReduceMotion}
              />
              <AccessibilityOption
                icon={Type}
                title="Readable font"
                description="Use a clear system font for page text."
                checked={readableFont}
                onCheckedChange={toggleReadableFont}
              />
              <AccessibilityOption
                icon={Focus}
                title="Enhanced focus"
                description="Show a stronger outline around keyboard-focused controls."
                checked={enhancedFocus}
                onCheckedChange={toggleEnhancedFocus}
              />
            </div>
          </section>
        </div>

        <footer className="shrink-0 space-y-[12px] border-t border-border bg-background p-[16px]">
          <AccessibilityResetButton />
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Preferences are saved automatically in this browser.
          </p>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
