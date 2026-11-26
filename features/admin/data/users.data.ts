import type { AdminUser } from "@/features/admin/types/management.types";
import type { UserRole, UserStatus } from "@/features/auth/types/auth.types";

const names = [
  "Maya Thompson", "Ethan Chen", "Aisha Patel", "Noah Williams",
  "Olivia Martinez", "Liam Johnson", "Sofia Garcia", "Lucas Brown",
  "Amara Okafor", "James Wilson", "Priya Shah", "Benjamin Davis",
  "Isabella Rodriguez", "Daniel Kim", "Nadia Hassan", "Oliver Taylor",
  "Grace Lee", "Mateo Silva", "Zara Ahmed", "Henry Clark",
  "Emma Robinson", "Arjun Mehta", "Lily Anderson", "Samuel Wright",
  "Chloe Nguyen", "David Thompson", "Layla Ibrahim", "Jack Turner",
  "Mina Park", "Leo Martin", "Fatima Ali", "Ryan Cooper",
  "Eva Fischer", "Marcus Reed", "Elena Petrova", "Omar Farouk",
  "Hannah Brooks", "Ravi Nair", "Claire Dubois", "Andre Costa",
  "Tessa Morgan", "Victor Chen", "Jasmine Cole", "Felix Meyer",
  "Sana Rahman", "Admin Alex Morgan", "Admin Jordan Lee",
  "Admin Taylor Reed", "Admin Casey Wright", "Admin Robin Ellis",
] as const;

const statusForIndex = (index: number): UserStatus => {
  if (index % 13 === 0) return "SUSPENDED";
  if (index % 8 === 0) return "INACTIVE";
  return "ACTIVE";
};

const roleForIndex = (index: number): UserRole => {
  if (index < 33) return "STUDENT";
  if (index < 45) return "INSTRUCTOR";
  return "ADMIN";
};

const toEmail = (name: string, index: number) =>
  `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.+|\.+$/g, "")}.${String(index + 1).padStart(3, "0")}@example.com`;

export const sampleAdminUsers: AdminUser[] = names.map((name, index) => {
  const createdAt = new Date(
    Date.UTC(2026, 10, 25 - index * 9, 9),
  ).toISOString();
  const status = statusForIndex(index);

  return {
    id: `user-${String(index + 1).padStart(3, "0")}`,
    name,
    email: toEmail(name, index),
    avatar: null,
    role: roleForIndex(index),
    status,
    isEmailVerified: index % 7 !== 0,
    lastLoginAt:
      status === "SUSPENDED" || index % 9 === 0
        ? null
        : new Date(Date.UTC(2026, 10, 25 - (index % 35), 12)).toISOString(),
    createdAt,
  };
});
