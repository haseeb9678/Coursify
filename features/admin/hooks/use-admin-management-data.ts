"use client";

import { useSyncExternalStore } from "react";
import {
  getAdminDemoSnapshot,
  getInitialAdminDemoSnapshot,
  subscribeToAdminDemo,
} from "@/features/admin/store/admin-demo.store";

export function useAdminManagementData() {
  return useSyncExternalStore(
    subscribeToAdminDemo,
    getAdminDemoSnapshot,
    getInitialAdminDemoSnapshot,
  );
}
