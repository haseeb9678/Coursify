"use client";

import { createContext, useContext, type ReactNode } from "react";
import { instructorDocument } from "./instructor-documents";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { graphqlClient } from "@/lib/graphql/client";

const InstructorWorkspace = createContext(false);

export function InstructorCourseWorkspace({ children }: { children: ReactNode }) {
  return <InstructorWorkspace.Provider value>{children}</InstructorWorkspace.Provider>;
}

export function useCourseWorkspace() {
  const instructor = useContext(InstructorWorkspace);
  const userId = useAuthStore((state) => state.user?.id);
  return { instructor, userId, coursesPath: instructor ? "/instructor/courses" : "/admin/courses" };
}

export function instructorKey(userId: string | undefined, ...keys: readonly unknown[]) {
  return ["instructor", userId, ...keys];
}

export function courseWorkspaceClient(instructor: boolean): Pick<typeof graphqlClient, "request"> {
  if (!instructor) return graphqlClient;
  const request = (document: string, variables?: Record<string, unknown>) => graphqlClient.request(instructorDocument(document), variables);
  // The shared course API calls the document-and-variables overload.
  return { request: request as typeof graphqlClient.request };
}
