"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthShell, FlipLink, formContainer, formItem } from "./AuthShell";
import { Divider, Field, FormMessage, SocialButtons, SubmitButton } from "./AuthParts";
import { LoginFormValues, loginSchema } from "@/validation/auth/login.schema";

const LoginForm = () => {
  const [formMessage, setFormMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  // Replace this function with your login API later.
  const onSubmit = async (values: LoginFormValues) => {
    setFormMessage("");

    try {
      // Example future integration:
      // await authService.login(values);

      console.log("Validated login data:", values);
      setFormMessage("Your form is valid. API integration is ready.");
    } catch (error) {
      console.error("Login error:", error);
      setFormMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthShell
      mode="login"
      panelTitle="Welcome back. Pick up where you left off."
      panelPoints={[
        "Your courses, right where you left them",
        "Progress synced across devices",
        "All your certificates in one place",
      ]}
    >
      <motion.div
        variants={formContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={formItem} className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Log in to Coursify
          </h1>
          <p className="text-sm text-slate-500">Good to see you again.</p>
        </motion.div>

        <SocialButtons onSelect={setFormMessage} />

        <Divider>or use your email</Divider>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            error={errors.email?.message}
            registration={register("email")}
          />

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            disabled={isSubmitting}
            error={errors.password?.message}
            registration={register("password")}
            labelAside={
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          <FormMessage message={formMessage} />

          <SubmitButton
            isSubmitting={isSubmitting}
            label="Log in"
            loadingLabel="Logging in..."
          />
        </form>

        <motion.p variants={formItem} className="text-center text-sm text-slate-500">
          New to Coursify?{" "}
          <FlipLink href="/signup" className="font-semibold text-blue-600 hover:underline">
            Create an account
          </FlipLink>
        </motion.p>
      </motion.div>
    </AuthShell>
  );
};

export default LoginForm;