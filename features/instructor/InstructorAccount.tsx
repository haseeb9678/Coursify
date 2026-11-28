"use client";

import { Camera, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import AvatarDialog from "@/features/storage/AvatarDialog";
import { safeMaterialUrl } from "@/features/commerce/commerce-format";
import { InstructorPage, panelClass, WorkspaceLink } from "./InstructorUI";

export function InstructorProfile() {
  const user = useAuthStore((state) => state.user);
  const [editing, setEditing] = useState(false);
  if (!user) return null;
  const avatar = safeMaterialUrl(user.avatar);
  return <InstructorPage>
    <AdminPageHeader title="My profile" description="View your instructor account and update your profile photo." />
    <section className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/10 via-brand-soft/50 to-card p-5 sm:p-7 lg:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 max-w-full items-center gap-4 sm:gap-5">
          <span aria-hidden="true" className="flex shrink-0 rounded-full bg-card p-1 shadow-sm [&>span]:size-16 sm:[&>span]:size-20">
            <AdminUserAvatar name={user.name} avatar={avatar} size="lg" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold text-primary">Instructor</p>
            <h2 className="wrap-break-word text-xl font-bold tracking-tight text-brand-text sm:text-3xl">{user.name}</h2>
            <p className="flex items-center gap-2 text-sm text-brand-text-muted">
              <Mail size={15} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 wrap-break-word">{user.email}</span>
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => setEditing(true)}><Camera aria-hidden="true" /> Change photo</Button>
      </div>
    </section>
    {editing && <AvatarDialog onClose={() => setEditing(false)} />}
  </InstructorPage>;
}

export function InstructorSettings() {
  const { theme, setTheme } = useTheme();
  return <InstructorPage>
    <AdminPageHeader title="Settings" description="Manage the appearance of your workspace." />
    <section className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-brand-text">Appearance</h2>
        <AdminFilterSelect label="Appearance" value={theme ?? "system"} onChange={setTheme}
          options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
      </div>
      <div className="flex border-t border-brand-border pt-4 sm:justify-end">
        <WorkspaceLink href="/instructor/profile">Profile and photo</WorkspaceLink>
      </div>
    </section>
  </InstructorPage>;
}
