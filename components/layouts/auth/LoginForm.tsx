"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { enrollmentReturnPath } from "@/features/commerce/return-path";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  AuthShell,
  FlipLink,
  formContainer,
  formItem,
} from "./AuthShell";

import {
  Divider,
  Field,
  FormMessage,
  SocialButtons,
  SubmitButton,
} from "./AuthParts";

import {
  type LoginFormValues,
  loginSchema,
} from "@/validation/auth/login.schema";

import { useLogin } from "@/features/auth/hooks/use-login";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = enrollmentReturnPath(searchParams.get("returnTo"));

  const [formMessage, setFormMessage] = useState("");

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const isLoading = isSubmitting || loginMutation.isPending;

  // Handle user login
  const onSubmit = async (values: LoginFormValues) => {
    setFormMessage("");

    try {
      const response = await loginMutation.mutateAsync({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      toast.success(response.message);

      router.replace(response.user.role === "INSTRUCTOR" ? "/instructor/dashboard" :
        response.user.role === "STUDENT" && returnTo ? returnTo : "/");
    } catch (error: unknown) {
      const message = getGraphQLErrorMessage(error);

      setFormMessage(message);

      toast.error(message);
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
          <h1 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Log in to Coursify
          </h1>

          <p className="text-sm text-brand-text-muted">
            Good to see you again.
          </p>
        </motion.div>

        <SocialButtons onSelect={setFormMessage} />

        <Divider>or use your email</Divider>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isLoading}
            error={errors.email?.message}
            registration={register("email")}
          />

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            disabled={isLoading}
            error={errors.password?.message}
            registration={register("password")}
            labelAside={
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          <FormMessage message={formMessage} />

          <SubmitButton
            isSubmitting={isLoading}
            label="Log in"
            loadingLabel="Logging in..."
          />
        </form>

        <motion.p
          variants={formItem}
          className="text-center text-sm text-brand-text-muted"
        >
          New to Coursify?{" "}
          <FlipLink
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </FlipLink>
        </motion.p>
      </motion.div>
    </AuthShell>
  );
};

export default LoginForm;
