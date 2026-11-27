import type { Metadata } from "next";
import { StudentPaymentHistory } from "@/features/commerce/StudentFinance";

export const metadata: Metadata = { title: "Payment History | Coursify" };

export default function Page() {
  return <StudentPaymentHistory />;
}
