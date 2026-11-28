import { InstructorCourses } from "@/features/instructor/InstructorCourses";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { searchParams: Promise<{ q?: string; search?: string }> };

async function Content({ searchParams }: Props) {
  const { q, search } = await searchParams;
  const initial = typeof q === "string" ? q : typeof search === "string" ? search : "";
  return <InstructorCourses key={initial} initialSearch={initial} />;
}

export default function Page(props: Props) {
  return <Suspense fallback={<Skeleton className="m-5 h-72" />}><Content {...props} /></Suspense>;
}
