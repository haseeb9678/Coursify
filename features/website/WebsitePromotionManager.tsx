"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { usePublicPopups } from "./website-hooks";
import { PUBLIC_CONTENT_MAX_AGE_MS, estimatedServerTime, isFrequencyEligible, isMarketingPath, recordPopupDisplay } from "./website-display";
import PopupPresentation from "./PopupPresentation";
import type { PublicPopup } from "./website-types";
import { usePublicationClock } from "./use-publication-clock";

let displayedInDocument = false;

export default function WebsitePromotionManager() {
  const path = usePathname();
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const enabled = Boolean(path && isMarketingPath(path)) && !authLoading;
  const { data, isError, isFetching } = usePublicPopups(path ?? "", authenticated, enabled);
  const [candidate, setCandidate] = useState<{ campaign: PublicPopup; path: string; authenticated: boolean } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const selected = data?.campaigns.find((item) => item.id === candidate?.campaign.id);
  const cacheEnd = data ? Date.parse(data.serverTime) + PUBLIC_CONTENT_MAX_AGE_MS : Infinity;
  const expirationTimes = [data ? new Date(cacheEnd).toISOString() : "", selected?.endsAt].filter(Boolean).join(",");
  const clock = usePublicationClock(data, expirationTimes);
  const delay = useRef<{ context: string; key: string; since: number } | null>(null);
  const campaign = enabled && !isError && clock < cacheEnd && candidate?.path === path && candidate.authenticated === authenticated
    ? selected && (!selected.endsAt || Date.parse(selected.endsAt) > clock) ? selected : undefined
    : undefined;

  useEffect(() => {
    const context = JSON.stringify([path, authenticated]);
    if (delay.current?.context !== context || !enabled || isError) delay.current = null;
    if (!data || !enabled || isError || isFetching || displayedInDocument || !path) return;
    const next = data.campaigns.find((item) =>
      (!item.endsAt || Date.parse(item.endsAt) > estimatedServerTime(data)) && isFrequencyEligible(item),
    );
    if (!next) { delay.current = null; return; }
    const key = JSON.stringify([next.id, next.triggerType, next.delaySeconds]);
    if (delay.current?.key !== key) delay.current = { context, key, since: Date.now() };
    const delayMs = next.triggerType === "AFTER_DELAY" ? next.delaySeconds * 1000 : 0;
    let timer: number;
    function openWhenReady() {
      if (displayedInDocument || !next || !data || !path) return;
      if (estimatedServerTime(data) >= cacheEnd || (next.endsAt && Date.parse(next.endsAt) <= estimatedServerTime(data))) return;
      if (document.hidden || document.querySelector("dialog[open], [role=dialog][aria-modal=true]")) {
        timer = window.setTimeout(openWhenReady, 700);
        return;
      }
      if (!isFrequencyEligible(next)) return;
      setCandidate({ campaign: next, path, authenticated });
    }

    timer = window.setTimeout(openWhenReady, Math.max(0, delayMs - (Date.now() - delay.current.since)));
    return () => window.clearTimeout(timer);
  }, [data, enabled, isError, isFetching, path, authenticated, cacheEnd]);

  const liveId = campaign?.id;
  const presented = useRef<string | null>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !liveId) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    element.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.documentElement.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [liveId]);

  useEffect(() => {
    if (!campaign || !dialog.current?.open || presented.current === campaign.id) return;
    displayedInDocument = true;
    presented.current = campaign.id;
    recordPopupDisplay(campaign);
  }, [campaign]);

  return (
    <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} aria-modal="true"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-brand-border bg-card p-0 shadow-xl backdrop:bg-black/55"
      onCancel={(event) => { event.preventDefault(); setCandidate(null); }}>
      {campaign && (
        <PopupPresentation campaign={campaign} titleId={titleId} descriptionId={descriptionId} onClose={() => setCandidate(null)} />
      )}
    </dialog>
  );
}
