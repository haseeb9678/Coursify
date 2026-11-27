"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicPopup } from "./website-types";
import { canUseImageReference, canUseReference } from "./website-display";

export default function PopupPresentation({
  campaign, titleId, descriptionId, onClose, preview, mobile,
}: {
  campaign: PublicPopup; titleId?: string; descriptionId?: string; onClose: () => void; preview?: boolean; mobile?: boolean;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageUrl = campaign.layout !== "TEXT_ONLY" && campaign.imageUrl && canUseImageReference(campaign.imageUrl) ? campaign.imageUrl : null;
  const imageLeft = imageUrl && campaign.layout === "IMAGE_LEFT" && !mobile;
  const centered = campaign.layout === "CENTERED";
  const actions = [
    { label: campaign.primaryCtaLabel, href: campaign.primaryCtaHref, variant: "default" as const },
    { label: campaign.secondaryCtaLabel, href: campaign.secondaryCtaHref, variant: "outline" as const },
  ];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-card text-brand-text ${imageLeft ? "sm:grid sm:grid-cols-[2fr_3fr]" : ""}`}>
      <Button type="button" variant="outline" size="icon-sm" className="absolute right-3 top-3 z-10 rounded-full bg-card" aria-label="Close promotion" onClick={onClose}>
        <X size={16} aria-hidden="true" />
      </Button>
      {imageUrl && (
        <div className={`relative aspect-16/9 overflow-hidden bg-brand-soft ${imageLeft ? "sm:h-full sm:aspect-auto" : ""}`}>
          {failedImage !== imageUrl ? (
            <Image key={imageUrl} src={imageUrl} alt={campaign.imageAlt} fill unoptimized sizes="(max-width: 640px) 100vw, 560px" className="object-cover"
              onError={() => setFailedImage(imageUrl)} />
          ) : preview && (
            <p role="status" className="p-4 text-sm text-brand-text-muted">The image could not be loaded.</p>
          )}
        </div>
      )}
      <div className={`space-y-4 p-6 pt-10 ${centered ? "text-center" : ""}`}>
        <h2 id={titleId} className="wrap-break-word text-xl font-bold">{campaign.title || "Popup title"}</h2>
        <p id={descriptionId} className="whitespace-pre-line wrap-break-word text-sm leading-6 text-brand-text-muted">{campaign.description || "Popup description"}</p>
        <div className={`flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
          {actions.map(({ label, href, variant }) => label && (
            preview || !href || !canUseReference(href) ? (
              <Button key={variant} type="button" disabled variant={variant}>{label}</Button>
            ) : (
              <Button key={variant} variant={variant} nativeButton={false}
                render={href.startsWith("/") ? <Link href={href} /> : <a href={href} rel="noopener noreferrer" target="_blank" />}
                onClick={onClose}>
                {label}
              </Button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
