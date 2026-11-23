
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Menu,
  X,
  BookOpen,
  BriefcaseBusiness,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const closeMenu = () => setIsMenuOpen(false);
  const menuVariants = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 },
    },
  };
  const menuItemVariants = {
    closed: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  return (
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

        {/* Main navbar */}
        <div className="flex min-h-[76px] items-center justify-between gap-4">

          {/* Logo */}
          <motion.div
            className="shrink-0"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                <GraduationCap size={23} strokeWidth={2.2} />
              </span>

              <span className="text-2xl font-extrabold tracking-tight text-primary">
                Coursify
              </span>
            </Link>
          </motion.div>

          {/* Desktop search */}
          <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
            <SearchBar />
          </div>

        {/* Desktop navigation */}
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

        {/* Animated underline */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 ease-out group-hover:w-full"
        />
      </Link>
    </motion.div>
  ))}
</nav>
          {/* Desktop authentication */}
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
  whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  <Link
    href="/signup"
    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-primary/20"
  >
    {/* Light sweep */}
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

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex size-10 items-center justify-center rounded-lg border border-brand-border text-brand-text transition-colors hover:bg-brand-soft md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMenuOpen ? "close" : "open"}
                className="flex"
                initial={shouldReduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
              >
                {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile and tablet search */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>

        {/* Mobile navigation menu */}
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              key="mobile-navigation"
              className="overflow-hidden border-t border-brand-border md:hidden"
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.24,
                ease: "easeOut",
              }}
            >
              <motion.nav
                className="flex flex-col gap-1 py-4"
                initial={shouldReduceMotion ? false : "closed"}
                animate="open"
                variants={menuVariants}
              >

                <motion.div variants={menuItemVariants}>
                  <Link
                    href="/courses"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft hover:text-primary"
                  >
                    <BookOpen size={19} />
                    Explore Courses
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    href="/teach"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft hover:text-primary"
                  >
                    <BriefcaseBusiness size={19} />
                    Become an Instructor
                  </Link>
                </motion.div>

                <motion.div
                  className="my-3 border-t border-brand-border"
                  variants={menuItemVariants}
                />

                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={menuItemVariants}
                >
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center rounded-md border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
