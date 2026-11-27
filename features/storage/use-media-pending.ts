"use client";

import { useState } from "react";

export function useMediaPending() {
  const [fields, setFields] = useState<Record<string, boolean>>({});
  return {
    pending: Object.values(fields).some(Boolean),
    track: (name: string) => (active: boolean) => setFields((previous) => ({ ...previous, [name]: active })),
  };
}
