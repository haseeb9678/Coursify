import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StudentOrderPage } from "@/features/commerce/StudentCommerce";
import { CommerceLoading } from "@/features/commerce/CommerceUi";

type PageProps = { params: Promise<{ orderId: string }> };

async function Content({ params }: PageProps) {
  const { orderId } = await params;
  if (!/^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/.test(orderId)) notFound();
  return <StudentOrderPage orderId={orderId} />;
}

export default function Page({ params }: PageProps) {
  return <Suspense fallback={<div className="p-6"><CommerceLoading label="Loading order" /></div>}><Content params={params} /></Suspense>;
}
