"use client";

import { Eye, Pencil, Shield, UserRoundCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdminUser } from "@/features/admin/types/users.types";
import {
  AdminTableActionContent,
  AdminTableActionTrigger,
} from "@/components/layouts/admin/shared/AdminTableActionMenu";

interface UserActionsProps {
  user: AdminUser;
  isCurrentUser: boolean;
  isDisabled?: boolean;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onSuspend: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
}

export default function UserActions({
  user,
  isCurrentUser,
  isDisabled = false,
  onView,
  onEdit,
  onChangeRole,
  onSuspend,
  onActivate,
}: UserActionsProps) {
  return (
    <DropdownMenu>
      <AdminTableActionTrigger
        label={`Actions for ${user.name}`}
        disabled={isDisabled}
      />
      <AdminTableActionContent className="w-48">
        <DropdownMenuItem disabled={isDisabled} onClick={() => onView(user)}>
          <Eye size={15} aria-hidden="true" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isDisabled} onClick={() => onEdit(user)}>
          <Pencil size={15} aria-hidden="true" />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isCurrentUser || isDisabled}
          onClick={() => onChangeRole(user)}
        >
          <UserRoundCog size={15} aria-hidden="true" />
          Change role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.status !== "ACTIVE" ? (
          <DropdownMenuItem
            disabled={isCurrentUser || isDisabled}
            onClick={() => onActivate(user)}
          >
            <Shield size={15} aria-hidden="true" />
            Activate account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isCurrentUser || isDisabled}
            onClick={() => onSuspend(user)}
          >
            <Shield size={15} aria-hidden="true" />
            Suspend account
          </DropdownMenuItem>
        )}
      </AdminTableActionContent>
    </DropdownMenu>
  );
}
