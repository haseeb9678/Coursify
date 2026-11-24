import React from "react";


import Footer from "@/components/layouts/marketing/Footer";
import { footerColumns } from "@/features/home/data/footer.data";
import AuthNavbar from "@/components/layouts/auth/Navbar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip scrollbar-hide">
      {/* Shared Header */}
      <AuthNavbar />

      {/* Main Content */}
      <main className="relative flex w-full flex-1 flex-col">
        {/* Ambient Background Glows (kept very light) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 -z-10 size-[460px] rounded-full bg-brand-accent/[0.06] blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-48 -z-10 size-[320px] rounded-full bg-brand-accent/[0.04] blur-[110px]"
        />

        {/* Auth Pages */}
        {children}
      </main>

      {/* Shared Footer */}
      <Footer columns={footerColumns} />
    </div>
  );
}