"use client";

import { useState, type FormEvent } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";
import { commerceDate } from "./commerce-format";

const commentLimit = 2000;

export default function LessonDiscussion({ userId, courseId, lessonId }: {
  userId: string;
  courseId: string;
  lessonId: string;
}) {
  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const queryKey = [...commerceKeys.scope("student", userId), "lesson-comments", courseId, lessonId];
  const comments = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => commerceApi.lessonComments(courseId, lessonId, { page: pageParam, limit: 10 }),
    getNextPageParam: ({ meta }) => meta.hasNext ? meta.page + 1 : undefined,
    retry: false,
  });
  const post = useMutation({
    mutationFn: (body: string) => commerceApi.postLessonComment(courseId, lessonId, body),
    onSuccess: () => {
      setDraft("");
      toast.success("Comment posted.");
      return queryClient.invalidateQueries({ queryKey, exact: true });
    },
    onError: (error) => toast.error(getGraphQLErrorMessage(error)),
  });
  const total = comments.data?.pages[0]?.meta.total;
  const items = comments.data?.pages.flatMap((page) => page.items) ?? [];

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (body && !post.isPending) post.mutate(body);
  }

  return (
    <section aria-labelledby="lesson-discussion-title" className="rounded-2xl border border-brand-border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-brand-border px-4 py-4 sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
          <MessageSquare className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="lesson-discussion-title" className="font-bold text-brand-text sm:text-lg">Lesson discussion</h2>
          {total != null && <p className="text-xs text-brand-text-muted">{total} {total === 1 ? "comment" : "comments"}</p>}
        </div>
      </header>
      <div className="space-y-5 p-4 sm:p-6">
        <form onSubmit={submitComment} className="space-y-3">
          <label htmlFor="lesson-comment" className="block text-sm font-semibold text-brand-text">Add a comment</label>
          <textarea id="lesson-comment" value={draft} onChange={(event) => setDraft(event.target.value)}
            maxLength={commentLimit} rows={3} readOnly={post.isPending} required
            placeholder="Ask a question or share a takeaway from this lesson"
            className="block w-full resize-y rounded-xl border border-brand-border bg-background px-3 py-2.5 text-sm leading-relaxed text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="text-xs tabular-nums text-brand-text-muted">{draft.length.toLocaleString()} / {commentLimit.toLocaleString()}</span>
            <Button type="submit" size="lg" disabled={!draft.trim()} busy={post.isPending}>
              {!post.isPending && <Send aria-hidden="true" />} Post comment
            </Button>
          </div>
        </form>
        {comments.isPending && <div role="status" aria-label="Loading comments" className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full" />
        </div>}
        {comments.isError && <div className="flex flex-wrap items-center gap-2 text-sm text-brand-text-muted">
          <p role="alert">{getGraphQLErrorMessage(comments.error)}</p>
          <Button variant="outline" busy={comments.isFetching} onClick={() => void comments.refetch()}>Try again</Button>
        </div>}
        {!comments.isPending && !comments.isError && items.length === 0 && (
          <p className="rounded-xl border border-brand-border bg-brand-page-secondary px-4 py-4 text-sm text-brand-text-muted">
            No comments yet. Start the discussion with a question or a takeaway.
          </p>
        )}
        {items.length > 0 && <ul className="divide-y divide-brand-border border-t border-brand-border">
          {items.map(({ id, body, createdAt, author }) => (
            <li key={id} className="flex gap-3 py-4">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-primary">
                {author.name.trim().slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="wrap-break-word text-sm font-semibold text-brand-text">{author.name}</p>
                  <time dateTime={createdAt} className="text-xs text-brand-text-muted">{commerceDate(createdAt)}</time>
                </div>
                <p className="wrap-break-word text-sm leading-relaxed whitespace-pre-wrap text-brand-text">{body}</p>
              </div>
            </li>
          ))}
        </ul>}
        {comments.hasNextPage && <Button variant="outline" busy={comments.isFetchingNextPage} onClick={() => void comments.fetchNextPage()}>Load more comments</Button>}
      </div>
    </section>
  );
}
