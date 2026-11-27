import type { Metadata } from "next";
import { StudentPurchaseHistory } from "@/features/commerce/StudentFinance";

export const metadata: Metadata = { title: "Purchase History | Coursify" };

export default function Page() {
  return <StudentPurchaseHistory />;
}
