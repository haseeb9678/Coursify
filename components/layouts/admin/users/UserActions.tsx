"use client";

import { Archive, Eye, MoreHorizontal, Pencil, Shield, UserRoundCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/features/admin/types/management.types";

interface UserActionsProps {
  user: AdminUser;
  isCurrentUser: boolean;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onSuspend: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
  onArchive: (user: AdminUser) => void;
}

export default function UserActions({
  user,
  isCurrentUser,
  onView,
  onEdit,
  onChangeRole,
  onSuspend,
  onActivate,
  onArchive,
}: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${user.name}`}
          />
        }
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(user)}>
          <Eye size={15} aria-hidden="true" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Pencil size={15} aria-hidden="true" />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isCurrentUser}
          onClick={() => onChangeRole(user)}
        >
          <UserRoundCog size={15} aria-hidden="true" />
          Change role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.status !== "ACTIVE" ? (
          <DropdownMenuItem onClick={() => onActivate(user)}>
            <Shield size={15} aria-hidden="true" />
            Activate account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isCurrentUser}
            onClick={() => onSuspend(user)}
          >
            <Shield size={15} aria-hidden="true" />
            Suspend account
          </DropdownMenuItem>
        )}
        {user.status !== "INACTIVE" && (
          <DropdownMenuItem
            disabled={isCurrentUser}
            onClick={() => onArchive(user)}
            className="text-destructive focus:text-destructive"
          >
            <Archive size={15} aria-hidden="true" />
            Archive account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
