import { InstructorCourseDetails } from "@/features/instructor/InstructorCourses";

export default async function Page({ params, searchParams }: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ courseId }, { tab }] = await Promise.all([params, searchParams]);
  return <InstructorCourseDetails key={courseId} courseId={courseId} initialTab={tab} />;
}
