import Image from "next/image";
import { getUserInitials } from "@/features/dashboard/utils/dashboard.utils";

interface AdminUserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
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
}: AdminUserAvatarProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 font-semibold text-primary ${sizeClasses[size]}`}
      aria-label={name}
    >
      {avatar ? (
        <Image src={avatar} alt="" fill sizes="56px" className="object-cover" />
      ) : (
        getUserInitials(name)
      )}
    </span>
  );
}
