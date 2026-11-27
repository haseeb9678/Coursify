import CheckoutResultRoute, { type CheckoutSearchParams } from "@/features/commerce/CheckoutResultRoute";

export const metadata = { title: "Checkout status | Coursify", robots: { index: false, follow: false } };

export default function CheckoutStatusPage({ searchParams }: { searchParams: CheckoutSearchParams }) {
  return <CheckoutResultRoute searchParams={searchParams} cancelled={false} />;
}
