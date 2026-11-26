import type { Metadata } from "next";
import AdminDashboardClient from "@/components/layouts/admin/dashboard/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage the Coursify learning platform.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
