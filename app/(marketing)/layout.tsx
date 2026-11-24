import Footer from "@/components/layouts/marketing/Footer";
import Navbar from "@/components/layouts/marketing/Navbar";
import { footerColumns } from "@/features/home/data/footer.data";
import React from "react";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-x-clip scrollbar-hide">
      <Navbar />

      {/* Main content */}
      <main className="relative flex w-full flex-1 flex-col ">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-24 right-0 -z-10 size-[620px] rounded-full bg-brand-accent/10 blur-[130px]" />

        <div className="pointer-events-none absolute left-0 top-40 -z-10 size-[420px] rounded-full bg-brand-accent/[0.07] blur-[120px]" />

        {children}
      </main>

      <Footer
      columns={footerColumns}
      />
    </div>
  );
}