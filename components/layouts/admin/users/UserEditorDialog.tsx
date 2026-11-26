"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUser,
} from "@/features/admin/types/users.types";

const editorSchema = z.object({
  name: z.string().trim().min(2, "Enter a name with at least two characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().optional(),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).optional(),
});

const createUserSchema = editorSchema.extend({
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Use no more than 128 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter.")
    .regex(/[0-9]/, "Include at least one number."),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

type UserFormValues = z.infer<typeof editorSchema>;
type UserEditorSubmission = AdminCreateUserInput | AdminUpdateUserInput;

interface UserEditorDialogProps {
  open: boolean;
  user: AdminUser | null;
  isCurrentUser?: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: UserEditorSubmission) => Promise<boolean>;
}

const roleOptions = [
  { value: "STUDENT", label: "Student" },
  { value: "INSTRUCTOR", label: "Instructor" },
] as const;

export default function UserEditorDialog({
  open,
  user,
  isCurrentUser = false,
  isPending = false,
  onOpenChange,
  onSave,
}: UserEditorDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  useEffect(() => {
    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            password: "",
            role: undefined,
          }
        : {
            name: "",
            email: "",
            password: "",
            role: "STUDENT",
          },
    );
  }, [open, reset, user]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setShowPassword(false);
    onOpenChange(nextOpen);
  };

  const save = handleSubmit(async (values) => {
    if (!user) {
      const parsed = createUserSchema.safeParse(values);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const field = issue.path[0];
          if (
            field === "name" ||
            field === "email" ||
            field === "password" ||
            field === "role"
          ) {
            setError(field, { type: "manual", message: issue.message });
          }
        }
        return;
      }

      const saved = await onSave(parsed.data);
      if (saved) {
        reset();
        handleOpenChange(false);
      }
      return;
    }

    const updatedUser: AdminUpdateUserInput = { id: user.id };
    if (values.name.trim() !== user.name) {
      updatedUser.name = values.name.trim();
    }
    if (
      !isCurrentUser &&
      values.email.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      updatedUser.email = values.email.trim().toLowerCase();
    }

    if (updatedUser.name === undefined && updatedUser.email === undefined) {
      setError("root", {
        type: "manual",
        message: "Make at least one profile change before saving.",
      });
      return;
    }

    if (await onSave(updatedUser)) {
      reset();
      handleOpenChange(false);
    }
  });

  const isSaving = isSubmitting || isPending;

  return (
    <AdminDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={user ? "Edit user" : "Add user"}
      description={
        user
          ? "Update profile information. Role and account status are managed separately."
          : "Create a user account. New accounts start with an unverified email."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="admin-user-editor" disabled={isSaving}>
            {isSaving ? "Saving..." : user ? "Save changes" : "Add user"}
          </Button>
        </>
      }
    >
      <form id="admin-user-editor" onSubmit={save} className="space-y-4">
        <Field id={nameId} label="Full name" error={errors.name?.message}>
          <Input
            id={nameId}
            {...register("name")}
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
          />
        </Field>
        <Field id={emailId} label="Email address" error={errors.email?.message}>
          <Input
            id={emailId}
            {...register("email")}
            type="email"
            autoComplete="email"
            required
            readOnly={isCurrentUser}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
          />
        </Field>
        {!user && (
          <>
            <Field
              id={passwordId}
              label="Temporary password"
              error={errors.password?.message}
            >
              <div className="flex gap-2">
                <Input
                  id={passwordId}
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? `${passwordId}-error` : undefined
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] font-normal text-brand-text-muted">
                At least 8 characters with an uppercase letter, a lowercase
                letter, and a number.
              </p>
            </Field>
            <Field id={roleId} label="Role" error={errors.role?.message}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "STUDENT"}
                    disabled={isSaving}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                  >
                    <SelectTrigger
                      id={roleId}
                      aria-invalid={Boolean(errors.role)}
                      aria-required
                      aria-describedby={
                        errors.role ? `${roleId}-error` : undefined
                      }
                      className="h-10 w-full rounded-lg border-brand-border bg-background px-3 text-xs text-brand-text"
                    >
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      className="w-(--anchor-width) rounded-xl border-brand-border bg-popover p-1.5 text-popover-foreground shadow-xl"
                    >
                      {roleOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-lg py-2 text-xs font-medium"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </>
        )}
        {errors.root?.message && (
          <p role="alert" className="text-xs text-destructive">
            {errors.root.message}
          </p>
        )}
        {isCurrentUser && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-brand-text-muted">
            Your own email address cannot be changed here.
          </p>
        )}
      </form>
    </AdminDialog>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-brand-text">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-normal text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
