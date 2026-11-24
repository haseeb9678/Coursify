
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Menu,
  ArrowUpRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import SearchBar from "./SearchBar";
import MobileNavSidebar from "./MobileNavSidebar";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/90 backdrop-blur-xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.4,
          ease: "easeOut",
        }}
      >
        <div className="mx-auto px-4 sm:px-6 md:px-10 xl:px-15">
          <div className="flex min-h-[68px] items-center justify-between gap-4 sm:min-h-[76px]">

            {/* Logo */}
            <motion.div
              className="shrink-0"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm sm:size-10">
                  <GraduationCap size={23} strokeWidth={2.2} />
                </span>

                <span className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                  Coursify
                </span>
              </Link>
            </motion.div>

            {/* Desktop Search - Hidden Below md */}
            <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
              <SearchBar />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden shrink-0 items-center gap-7 lg:flex">
              {[
                { label: "Explore Courses", href: "/courses" },
                { label: "Teach", href: "/teach" },
              ].map((item) => (
                <motion.div
                  key={item.href}
                  whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="group relative inline-flex py-2 text-sm font-semibold text-brand-text-muted transition-colors duration-300 hover:text-primary"
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 ease-out group-hover:w-full"
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Desktop Authentication */}
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft hover:text-primary"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/signup"
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-primary/20"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                  />

                  <span className="relative">Sign Up</span>

                  <ArrowUpRight
                    size={17}
                    className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </motion.div>
            </div>

            {/* Mobile / Tablet Sidebar Toggle */}
            <motion.button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isSidebarOpen}
              aria-haspopup="dialog"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-text transition-all duration-200 hover:border-primary/30 hover:bg-brand-soft hover:text-primary lg:hidden"
            >
              <Menu size={21} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Separate Mobile Sidebar */}
      <MobileNavSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
    </>
  );
};

export default Navbar;
