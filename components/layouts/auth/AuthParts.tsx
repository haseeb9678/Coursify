"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { formItem } from "./AuthShell";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Input styling                                                       */
/* ------------------------------------------------------------------ */

const inputBase =
  "h-12 w-full rounded-xl border bg-card px-4 text-sm text-brand-text outline-none transition placeholder:text-brand-text-muted focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-brand-page-secondary";

const inputState = (hasError: boolean) =>
  hasError
    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15"
    : "border-brand-border hover:border-primary/50 focus-visible:border-primary focus-visible:ring-primary/10";

/* ------------------------------------------------------------------ */
/* Field (text / email / password with show-hide)                      */
/* ------------------------------------------------------------------ */

type FieldProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  registration: UseFormRegisterReturn;
  labelAside?: ReactNode;
};

export const Field = ({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  error,
  hint,
  registration,
  labelAside,
}: FieldProps) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <motion.div variants={formItem} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-brand-text">
          {label}
        </label>
        {labelAside}
      </div>

      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
          className={`${inputBase} ${isPassword ? "pr-12" : ""} ${inputState(!!error)}`}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-brand-text-muted transition hover:text-brand-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={show ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                className="flex"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-xs font-medium text-destructive"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-brand-text-muted"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Social buttons + divider                                            */
/* ------------------------------------------------------------------ */

export const SocialButtons = ({ onSelect }: { onSelect: (message: string) => void }) => {
  const providers = [
    { name: "Google", icon: <GoogleIcon /> },
    { name: "GitHub", icon: <GitHubIcon /> },
  ];

  return (
    <motion.div
      variants={formItem}
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2"
    >
      {providers.map((provider) => (
        <motion.button
          key={provider.name}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(`${provider.name} authentication is coming soon.`)}
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-brand-border bg-card text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
        >
          {provider.icon}
          {provider.name}
        </motion.button>
      ))}
    </motion.div>
  );
};

export const Divider = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={formItem}
    className="flex items-center gap-3 text-xs text-brand-text-muted"
  >
    <span className="h-px flex-1 bg-brand-border" />
    {children}
    <span className="h-px flex-1 bg-brand-border" />
  </motion.div>
);

/* ------------------------------------------------------------------ */
/* Form message + submit button                                        */
/* ------------------------------------------------------------------ */

export const FormMessage = ({ message }: { message: string }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        key={message}
        role="status"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {message}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const SubmitButton = ({
  isSubmitting,
  label,
  loadingLabel,
}: {
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
}) => (
  <motion.button
    variants={formItem}
    type="submit"
    disabled={isSubmitting}
    whileHover={isSubmitting ? undefined : { y: -1 }}
    whileTap={isSubmitting ? undefined : { scale: 0.98 }}
    className="group relative flex h-12 w-full items-center justify-center gap-2
      overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground
      shadow-sm shadow-primary/20 transition-all duration-300
      hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-primary/25
      focus-visible:outline-none focus-visible:ring-4
      focus-visible:ring-primary/25
      disabled:cursor-not-allowed disabled:opacity-70"
  >
    {/* Light Sweep Effect */}
    {!isSubmitting && (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3
          -skew-x-12 bg-gradient-to-r from-transparent via-white/35
          to-transparent opacity-0 transition-all duration-700
          group-hover:left-[120%] group-hover:opacity-100"
      />
    )}

    {/* Button Content */}
    <span className="relative z-10 flex items-center justify-center gap-2">
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </span>
  </motion.button>
);