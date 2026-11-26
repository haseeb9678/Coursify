"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import type { AdminUser, CreateUserInput } from "@/features/admin/types/management.types";

const userFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a name with at least two characters."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  isEmailVerified: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserEditorDialogProps {
  open: boolean;
  user: AdminUser | null;
  isCurrentUser?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CreateUserInput) => boolean;
}

const roleOptions = [
  { value: "STUDENT", label: "Student" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "ADMIN", label: "Admin" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const formSelectClassName =
  "h-10 w-full rounded-lg border border-brand-border bg-background px-3 text-xs text-brand-text outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

export default function UserEditorDialog({
  open,
  user,
  isCurrentUser = false,
  onOpenChange,
  onSave,
}: UserEditorDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "STUDENT",
      status: "ACTIVE",
      isEmailVerified: false,
    },
  });

  useEffect(() => {
    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
          }
        : {
            name: "",
            email: "",
            role: "STUDENT",
            status: "ACTIVE",
            isEmailVerified: false,
          },
    );
  }, [reset, user, open]);

  const save = handleSubmit((values) => {
    if (onSave(values)) onOpenChange(false);
  });

  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? "Edit user" : "Add user"}
      description="Update a local demo account. No credentials or emails are created."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="admin-user-editor" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : user ? "Save changes" : "Add user"}
          </Button>
        </>
      }
    >
      <form id="admin-user-editor" onSubmit={save} className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <Input {...register("name")} autoComplete="name" required />
        </Field>
        <Field label="Email address" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            required
            readOnly={isCurrentUser}
          />
        </Field>
        <Field label="Role">
          {isCurrentUser ? (
            <>
              <select value={user?.role ?? "STUDENT"} disabled className={formSelectClassName}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input type="hidden" {...register("role")} />
            </>
          ) : (
            <select {...register("role")} className={formSelectClassName}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Account status">
          {isCurrentUser ? (
            <>
              <select value={user?.status ?? "ACTIVE"} disabled className={formSelectClassName}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input type="hidden" {...register("status")} />
            </>
          ) : (
            <select {...register("status")} className={formSelectClassName}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
        </Field>
        <label className="flex items-center gap-2 text-xs text-brand-text">
          <input
            type="checkbox"
            {...register("isEmailVerified")}
            className="size-4 accent-primary"
          />
          Email address is verified
        </label>
        {isCurrentUser && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-brand-text-muted">
            Your own role and account status cannot be changed here.
          </p>
        )}
      </form>
    </AdminDialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium text-brand-text">
      {label}
      {children}
      {error && <span className="block text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}
