import React from "react";


import Footer from "@/components/layouts/marketing/Footer";
import { footerColumns } from "@/features/home/data/footer.data";
import AuthNavbar from "@/components/layouts/auth/Navbar";
import GuestGuard from "@/features/auth/guards/guest-guard";
import AccessibilityButton from "@/components/accessibility/AccessibilityButton";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background text-foreground scrollbar-hide">
      {/* Shared Header */}
      <AuthNavbar />

      {/* Main Content */}
      <main className="relative isolate flex w-full flex-1 flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-background via-background to-brand-soft/35" />
          <div className="absolute -right-40 top-[8%] size-[34rem] rounded-full bg-primary/[0.07] blur-[110px]" />

          <div className="absolute inset-0 text-primary">
            <div
              className="absolute inset-0 opacity-[0.09] sm:opacity-[0.1] dark:opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.42) 28%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.9) 100%)",
              }}
            />
            <div className="absolute left-[8%] top-[14%] hidden size-12 rounded-xl border border-primary/10 bg-primary/[0.025] opacity-30 sm:block" />
            <div className="absolute left-[26%] top-[38%] hidden size-16 rounded-2xl border border-primary/10 bg-card/20 opacity-40 sm:block" />
            <div className="absolute left-[44%] top-[18%] hidden size-14 rounded-xl border border-primary/12 bg-primary/[0.03] opacity-50 sm:block" />
            <div className="absolute left-[63%] top-[58%] hidden size-16 rounded-2xl border border-primary/12 bg-card/25 opacity-60 sm:block" />
            <div className="absolute left-[82%] top-[30%] hidden size-14 rounded-xl border border-primary/15 bg-primary/[0.04] opacity-70 sm:block" />
          </div>
        </div>

        {/* Auth Pages */}
          <GuestGuard redirectTo="/student/dashboard">
      {children}
       </GuestGuard>
       
      </main>

      {/* Shared Footer */}
      <Footer columns={footerColumns} />
      <AccessibilityButton variant="floating" />
    </div>
  );
}