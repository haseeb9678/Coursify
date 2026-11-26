"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  type SignupFormValues,
  signupSchema,
} from "@/validation/auth/signup.schema";

import { useRegister } from "@/features/auth/hooks/use-register";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

const SignupForm = () => {
  const router = useRouter();

  const [formMessage, setFormMessage] = useState("");

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const isLoading = isSubmitting || registerMutation.isPending;

  // Handle user registration
  const onSubmit = async (values: SignupFormValues) => {
    setFormMessage("");

    try {
      const response = await registerMutation.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      toast.success(response.message);

      router.replace("/login");
    } catch (error: unknown) {
      const message = getGraphQLErrorMessage(error);

      setFormMessage(message);

      toast.error(message);
    }
  };

  return (
    <AuthShell
      mode="signup"
      panelTitle="Build skills that get you hired."
      panelPoints={[
        "Free starter courses in design & development",
        "Certificates you can share",
        "Learn at your own pace",
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
            Create your account
          </h1>

          <p className="text-sm text-slate-500">
            Free to start. No credit card needed.
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
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="Your full name"
            disabled={isLoading}
            error={errors.name?.message}
            registration={register("name")}
          />

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
            autoComplete="new-password"
            placeholder="At least 12 characters"
            hint="Include uppercase, lowercase and a number."
            disabled={isLoading}
            error={errors.password?.message}
            registration={register("password")}
          />

          <FormMessage message={formMessage} />

          <SubmitButton
            isSubmitting={isLoading}
            label="Create account"
            loadingLabel="Creating account..."
          />
        </form>

        <motion.div
          variants={formItem}
          className="space-y-3 text-center"
        >
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <FlipLink
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Log in
            </FlipLink>
          </p>

          <p className="text-xs leading-relaxed text-slate-400">
            By signing up, you agree to our{" "}
            <a
              href="/terms"
              className="underline hover:text-blue-600"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline hover:text-blue-600"
            >
              Privacy Policy
            </a>
            .
          </p>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
};

export default SignupForm;