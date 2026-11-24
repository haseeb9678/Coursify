
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
 
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const closeMenu = () => setIsMenuOpen(false);


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

        

        </div>


       
      </div>
    </motion.header>
  );
};

export default Navbar;
