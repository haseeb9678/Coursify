
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

import type {
  FooterColumn,
  SocialLink,
} from "@/features/courses/types/footer.types";

interface FooterProps {
  columns: FooterColumn[];
  socialLinks?: SocialLink[];
  onSubscribe?: (email: string) => Promise<void>;
}

export default function Footer({
  columns,
  socialLinks = [],
  onSubscribe,
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Same initial value on server and client prevents hydration mismatch.
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    (() => {
      setCurrentYear(new Date().getFullYear());
      
    })()
  }, []);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSubscribe || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setMessage("");
      setIsSuccess(false);

      await onSubscribe(email.trim());

      setEmail("");
      setIsSuccess(true);
      setMessage("Thanks for subscribing! You're on the list.");
    } catch {
      setIsSuccess(false);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-brand-soft-border bg-brand-soft pt-16 pb-10">
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-18 border-b border-brand-soft-border pb-12 lg:grid-cols-12">

          {/* Brand & Newsletter Column */}
          <div className="space-y-5 lg:col-span-4">

            {/* Logo */}
            <Link
              href="/"
              aria-label="Coursify homepage"
              className="group relative inline-flex flex-col items-start gap-2 overflow-hidden rounded-xl py-2"
            >
              <span className="relative flex items-center gap-2.5">

                {/* Logo Icon */}
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-all duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
                  <GraduationCap size={23} strokeWidth={2.2} />
                </span>

                {/* Brand Name */}
                <span className="text-4xl font-extrabold tracking-[-0.055em] text-brand-text transition-colors duration-300 group-hover:text-brand-primary sm:text-5xl">
                  Coursify
                  <span className="text-brand-primary transition-colors duration-300 group-hover:text-brand-text">
                    .
                  </span>
                </span>

                {/* Light Sweep Effect */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/3 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                />
              </span>
            </Link>

            {/* Description */}
            <p className="max-w-sm text-sm leading-relaxed text-brand-text-muted">
              Empowering learners worldwide with accessible,
              industry-relevant skills for the digital economy.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="pt-1">
              <label
                htmlFor="footer-newsletter-email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-text"
              >
                Subscribe to our newsletter
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage("");
                  }}
                  disabled={!onSubscribe || isSubmitting}
                  placeholder="Enter your email"
                  className="h-10 min-w-0 flex-1 rounded-md border border-[#CBD5E1] bg-white px-3.5 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!onSubscribe || isSubmitting || !email.trim()}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-brand-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Newsletter Feedback */}
              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    isSuccess ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {isSuccess && <CheckCircle2 size={14} />}
                  {message}
                </p>
              )}

              {!onSubscribe && (
                <p className="mt-2 text-xs text-brand-text-muted">
                  Newsletter subscriptions will be available soon.
                </p>
              )}
            </form>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8 lg:gap-8">
            {columns.map((column) => (
              <div key={column.id} className="space-y-3.5">
                <h3 className="text-sm font-bold text-brand-text">
                  {column.title}
                </h3>

                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-sm text-brand-text-muted transition-colors hover:text-brand-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Social Links */}
        <div className="flex flex-col items-center justify-between gap-5 pt-8 sm:flex-row">

          {/* Copyright */}
          <p className="text-center text-xs leading-relaxed text-brand-text-muted sm:text-left">
            © {currentYear} Coursify. All rights reserved.
          </p>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex size-8 items-center justify-center rounded-md bg-brand-primary text-xs font-bold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover"
                >
                  {social.label.charAt(0)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
