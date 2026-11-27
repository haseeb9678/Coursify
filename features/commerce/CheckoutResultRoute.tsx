import { Suspense } from "react";
import { CheckoutResult } from "./CheckoutViews";
import { CommerceLoading } from "./CommerceUi";

export type CheckoutSearchParams = Promise<{ order?: string | string[]; session_id?: string | string[] }>;

async function ResultContent({ searchParams, cancelled }: { searchParams: CheckoutSearchParams; cancelled: boolean }) {
  const values = await searchParams;
  const orderId = typeof values.order === "string" && /^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/.test(values.order)
    ? values.order : "";
  const sessionId = typeof values.session_id === "string" && /^cs_test_[A-Za-z0-9_]{1,240}$/.test(values.session_id)
    ? values.session_id : undefined;
  return <CheckoutResult orderId={orderId} sessionId={sessionId} returnedAfterCancel={cancelled} />;
}

export default function CheckoutResultRoute({ searchParams, cancelled }: { searchParams: CheckoutSearchParams; cancelled: boolean }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10"><CommerceLoading label="Loading checkout status" /></div>}>
      <ResultContent searchParams={searchParams} cancelled={cancelled} />
    </Suspense>
  );
}
