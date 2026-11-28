"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { getUserInitials } from "@/features/dashboard/utils/dashboard.utils";
import { isMediaUrl } from "@/features/storage/direct-upload";
import { cn } from "@/lib/utils";

interface AdminUserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-14 text-base",
} as const;

export default function AdminUserAvatar({
  name,
  avatar,
  size = "md",
  className,
}: AdminUserAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const source = avatar && isMediaUrl(avatar, true) && failedUrl !== avatar ? avatar : null;
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 font-semibold text-primary", sizeClasses[size], className)}
      aria-label={name}
    >
      {source ? (
        <Image src={source} alt="" fill unoptimized sizes="56px" className="object-cover" onError={() => setFailedUrl(source)} />
      ) : (
        getUserInitials(name) || <UserRound size={18} aria-hidden="true" />
      )}
    </span>
  );
}
