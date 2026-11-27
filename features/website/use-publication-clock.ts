"use client";

import { useEffect, useState } from "react";
import { estimatedServerTime } from "./website-display";

export function usePublicationClock(data: { serverTime: string; receivedAt: number } | undefined, expirations: string) {
  const [lastTick, setLastTick] = useState(0);

  useEffect(() => {
    if (!data || !expirations) return;
    const times = expirations.split(",").map((value) => Date.parse(value)).sort((a, b) => a - b);
    let timer: number;
    function tick() {
      if (!data) return;
      const now = estimatedServerTime(data);
      setLastTick(now);
      const next = times.find((time) => time > now);
      if (next !== undefined) timer = window.setTimeout(tick, Math.min(next - now + 1, 2_147_483_647));
    }
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [data, expirations]);

  return Math.max(lastTick, data ? Date.parse(data.serverTime) : 0);
}
