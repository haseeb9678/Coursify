"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell, FlipLink, formContainer, formItem } from "./AuthShell";
import { Divider, Field, FormMessage, SocialButtons, SubmitButton } from "./AuthParts";
import { SignupFormValues, signupSchema } from "@/validation/auth/signup.schema";

const SignupForm = () => {
  const [formMessage, setFormMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onBlur",
  });

  // Replace this function with your registration API later.
  const onSubmit = async (values: SignupFormValues) => {
    setFormMessage("");

    try {
      // Example future integration:
      // await authService.register(values);

      console.log("Validated signup data:", values);
      setFormMessage("Your form is valid. API integration is ready.");
    } catch (error) {
      console.error("Signup error:", error);
      setFormMessage("Something went wrong. Please try again.");
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
          <p className="text-sm text-slate-500">Free to start. No credit card needed.</p>
        </motion.div>

        <SocialButtons onSelect={setFormMessage} />

        <Divider>or use your email</Divider>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="Your full name"
            disabled={isSubmitting}
            error={errors.name?.message}
            registration={register("name")}
          />

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            hint="Include uppercase, lowercase and a number."
            disabled={isSubmitting}
            error={errors.password?.message}
            registration={register("password")}
          />

          <FormMessage message={formMessage} />

          <SubmitButton
            isSubmitting={isSubmitting}
            label="Create account"
            loadingLabel="Creating account..."
          />
        </form>

        <motion.div variants={formItem} className="space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <FlipLink href="/login" className="font-semibold text-blue-600 hover:underline">
              Log in
            </FlipLink>
          </p>

          <p className="text-xs leading-relaxed text-slate-400">
            By signing up, you agree to our{" "}
            <a href="/terms" className="underline hover:text-blue-600">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-blue-600">
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