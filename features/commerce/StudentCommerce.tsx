"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, FileText, Link2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";
import { safeMaterialUrl } from "./commerce-format";
import type { LearningLesson } from "./commerce.types";
import { CommerceLink, CommerceLoading, CommerceMessage } from "./CommerceUi";
import { OrderRecord } from "./CommerceRecords";
import LessonDiscussion from "./LessonDiscussion";
import LessonVideoPlayer from "./LessonVideoPlayer";
import { ManagedMedia } from "@/features/storage/ManagedMedia";
import StudentCourseModules, { lessonTypes } from "./StudentCourseModules";
import StudentLearningSkeleton from "./StudentLearningSkeleton";
import { useStudentId } from "./student-queries";

export function StudentOrderPage({ orderId }: { orderId: string }) {
  const userId = useStudentId();
  const order = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "order", orderId],
    queryFn: () => commerceApi.order(false, orderId), enabled: !!userId, retry: false,
  });
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Order Details" description="Review the purchase and its payment attempts."
        actions={<CommerceLink href="/student/purchase-history">Purchase History</CommerceLink>} />
      {order.isPending ? <CommerceLoading /> : order.isError || !order.data
        ? <CommerceMessage title="Order unavailable" message={getGraphQLErrorMessage(order.error)}
          actions={<Button variant="outline" busy={order.isFetching} onClick={() => void order.refetch()}>Try again</Button>} />
        : <div className="rounded-xl border border-brand-border bg-card p-5"><OrderRecord student order={order.data} /></div>}
    </main>
  );
}

export function StudentLearningPage({ courseId }: { courseId: string }) {
  const userId = useStudentId();
  const [selectedId, setSelectedId] = useState<string>();
  const learning = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "learning", courseId],
    queryFn: () => commerceApi.learning(courseId), enabled: !!userId, retry: false, staleTime: 0, gcTime: 0,
  });
  if (!userId || learning.isPending) return <StudentLearningSkeleton />;
  if (learning.isError || !learning.data) return (
    <main className="w-full p-4 sm:p-6 lg:p-8">
      <CommerceMessage title="Course content unavailable" message={getGraphQLErrorMessage(learning.error)}
        actions={<>
          <CommerceLink href="/student/my-courses"><ArrowLeft aria-hidden="true" /> My Courses</CommerceLink>
          <Button variant="outline" busy={learning.isFetching} onClick={() => void learning.refetch()}>Try again</Button>
        </>} />
    </main>
  );

  const course = learning.data;
  const lessons = course.sections.flatMap((section) => section.lessons);
  const selected = lessons.find((lesson) => lesson.id === selectedId) ?? lessons[0];

  function selectLesson(id: string) {
    setSelectedId(id);
    if (window.matchMedia("(width < 80rem)").matches) {
      requestAnimationFrame(() => document.getElementById("student-lesson-heading")?.focus());
    }
  }

  return (
    <main className="w-full min-w-0">
      <header className="flex flex-col gap-5 border-b border-brand-border bg-linear-to-br from-brand-soft/75 via-brand-page-secondary to-background px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-card text-primary shadow-sm sm:size-13">
            <BookOpen className="size-5 sm:size-6" aria-hidden="true" />
          </span>
          <h1 className="wrap-break-word text-2xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-3xl xl:text-4xl">{course.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <CommerceLink href="/student/my-courses"><ArrowLeft aria-hidden="true" /> My Courses</CommerceLink>
          {selected && <Button variant="outline" className="xl:hidden" nativeButton={false} render={<a href="#student-course-content" />}>
            <ArrowDown aria-hidden="true" /> Course content
          </Button>}
        </div>
      </header>
      {selected ? (
        <div className="grid items-start gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_21rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <LearningLessonPanel key={`${userId}-${selected.id}`} courseId={course.id} lesson={selected} />
            <div id="student-lesson-discussion" className="scroll-mt-24">
              <LessonDiscussion key={`${userId}-${selected.id}`} userId={userId} courseId={course.id} lessonId={selected.id} />
            </div>
          </div>
          <StudentCourseModules key={course.id} sections={course.sections} lessonCount={lessons.length} activeLesson={selected.id} onSelect={selectLesson} />
        </div>
      ) : <div className="p-4 sm:p-6 lg:p-8"><CommerceMessage title="No lessons are available for this course" /></div>}
    </main>
  );
}

function LearningLessonPanel({ courseId, lesson }: { courseId: string; lesson: LearningLesson }) {
  const { icon: Icon, label } = lessonTypes[lesson.type];
  const video = safeMaterialUrl(lesson.videoUrl);
  const document = safeMaterialUrl(lesson.documentUrl);
  const resources = lesson.resources.flatMap((resource) => {
    const href = safeMaterialUrl(resource.url);
    return href || resource.hasManagedMedia ? [{ ...resource, href }] : [];
  });
  return (
    <article aria-labelledby="student-lesson-heading" className="min-w-0 divide-y divide-brand-border rounded-2xl border border-brand-border bg-card shadow-sm">
      <header className="space-y-3 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary"><Icon aria-hidden="true" /> {label}</Badge>
          <a href="#student-lesson-discussion" className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <MessageSquare className="size-3.5" aria-hidden="true" /> Discussion
          </a>
        </div>
        <h2 id="student-lesson-heading" tabIndex={-1} className="scroll-mt-24 wrap-break-word text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">{lesson.title}</h2>
        {lesson.description && <p className="wrap-break-word text-sm leading-relaxed whitespace-pre-wrap text-brand-text-muted sm:text-base">{lesson.description}</p>}
      </header>
      {lesson.type === "VIDEO" && (
        <div className="p-4 sm:p-6 lg:p-8">{lesson.hasManagedMedia ? <ManagedMedia kind="video" courseId={courseId} lessonId={lesson.id} title={lesson.title} /> : video ? <LessonVideoPlayer source={video} title={lesson.title} />
          : <p className="rounded-xl border border-brand-border bg-brand-page-secondary p-4 text-sm text-brand-text-muted">A video is unavailable for this lesson.</p>}</div>
      )}
      {lesson.type === "PDF" && (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-brand-page-secondary p-4 sm:gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary"><FileText aria-hidden="true" className="size-5" /></span>
            <p className="min-w-0 flex-1 text-sm font-semibold text-brand-text">{document || lesson.hasManagedMedia ? "Lesson PDF" : "A PDF is unavailable for this lesson."}</p>
            {lesson.hasManagedMedia && <ManagedMedia kind="pdf" courseId={courseId} lessonId={lesson.id} title={lesson.title} />}
            {!lesson.hasManagedMedia && document && <Button size="lg" nativeButton={false} render={<a href={document} target="_blank" rel="noreferrer" />}>
              Open lesson PDF <ArrowUpRight aria-hidden="true" />
            </Button>}
          </div>
        </div>
      )}
      {lesson.content && <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[80ch] wrap-break-word text-sm leading-relaxed whitespace-pre-wrap text-brand-text sm:text-base">{lesson.content}</div>
      </div>}
      {!!resources.length && (
        <section className="space-y-3 p-4 sm:p-6 lg:p-8">
          <h3 className="font-semibold text-brand-text">Lesson resources</h3>
          <ul className="grid gap-2 lg:grid-cols-2">
            {resources.map(({ id, href, title, type, hasManagedMedia }) => (
              <li key={id} className="min-w-0">
                {hasManagedMedia ? <ManagedMedia kind="document" courseId={courseId} lessonId={lesson.id} resourceId={id} title={title} /> : <a href={href ?? undefined} target="_blank" rel="noreferrer"
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:border-primary/40 hover:bg-brand-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {type === "PDF" ? <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" /> : <Link2 className="size-4 shrink-0 text-primary" aria-hidden="true" />}
                  <span className="min-w-0 flex-1 wrap-break-word">{title}<span className="block text-xs font-normal text-brand-text-muted">{type === "PDF" ? "PDF document" : "External link"}</span></span>
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
