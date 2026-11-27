"use client";

import { useState } from "react";
import HeroSection from "@/components/layouts/marketing/Hero";
import { Button } from "@/components/ui/button";
import PopupPresentation from "./PopupPresentation";
import { canUseImageReference, toHeroSlide } from "./website-display";
import { heroInput, popupInput, type WebsiteForm } from "./website-forms";
import type { WebsiteKind } from "./website-types";

export default function AdminWebsitePreview({ kind, values }: { kind: WebsiteKind; values: WebsiteForm }) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [open, setOpen] = useState(true);
  const previewValues = { ...values, startsAt: "", endsAt: "" };

  return (
    <section className="min-w-0 space-y-3" aria-label="Live preview">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-brand-text">Preview</h3>
        <div className="flex gap-1">
          {(["desktop", "mobile"] as const).map((mode) => (
            <Button key={mode} type="button" variant={mode === viewport ? "default" : "outline"} size="sm"
              aria-pressed={mode === viewport} onClick={() => { setViewport(mode); setOpen(true); }}>
              {mode === "desktop" ? "Desktop" : "Mobile"}
            </Button>
          ))}
        </div>
      </div>
      <div className={`mx-auto overflow-hidden rounded-xl border border-brand-border bg-brand-page-secondary ${viewport === "mobile" ? "max-w-sm" : "w-full"}`}>
        {kind === "hero" ? (
          <HeroSection preview={viewport} slides={[toHeroSlide({
            ...heroInput({
              ...previewValues,
              title: values.title || "Hero heading",
              imageUrl: canUseImageReference(values.imageUrl.trim()) ? values.imageUrl : "",
              mobileImageUrl: canUseImageReference(values.mobileImageUrl.trim()) ? values.mobileImageUrl : "",
            }), id: "preview", position: 1,
          })]} />
        ) : open ? (
          <PopupPresentation campaign={{ ...popupInput(previewValues), id: "preview" }} preview mobile={viewport === "mobile"} onClose={() => setOpen(false)} />
        ) : (
          <div className="flex min-h-36 items-center justify-center">
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>Open preview</Button>
          </div>
        )}
      </div>
    </section>
  );
}
