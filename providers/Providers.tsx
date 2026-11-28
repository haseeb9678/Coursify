
"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import AccessibilityProvider from "@/components/accessibility/AccessibilityProvider";
import { isAuthenticationError } from "@/lib/graphql/error";
import { SessionRefreshUnavailableError } from "@/lib/graphql/session-transport";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => failureCount < 1 &&
              !isAuthenticationError(error) && !(error instanceof SessionRefreshUnavailableError),
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        storageKey="coursify-theme"
      >
        <AccessibilityProvider>{children}</AccessibilityProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
