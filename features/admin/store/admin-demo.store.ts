import type {
  AdminDemoSnapshot,
  CreateUserInput,
  InstructorApprovalStatus,
  UpdateUserInput,
} from "@/features/admin/types/management.types";
import { initialAdminDemoSnapshot } from "@/features/admin/data/management-demo.data";

let snapshot = initialAdminDemoSnapshot;
let nextUserNumber = snapshot.users.length + 1;
const listeners = new Set<() => void>();

export function getAdminDemoSnapshot() {
  return snapshot;
}

export function getInitialAdminDemoSnapshot() {
  return initialAdminDemoSnapshot;
}

export function subscribeToAdminDemo(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(nextSnapshot: AdminDemoSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

export function createAdminDemoUser(input: CreateUserInput) {
  const timestamp = new Date().toISOString();
  const user = {
    ...input,
    id: `demo-user-${String(nextUserNumber++).padStart(3, "0")}`,
    avatar: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: null,
  };

  publish({
    ...snapshot,
    users: [...snapshot.users, user],
    students:
      input.role === "STUDENT"
        ? [
            ...snapshot.students,
            { userId: user.id, enrollments: [], certificates: [], lastActivityAt: null },
          ]
        : snapshot.students,
    instructors:
      input.role === "INSTRUCTOR"
        ? [
            ...snapshot.instructors,
            {
              userId: user.id,
              specialization: "General",
              bio: "New demo instructor profile.",
              courses: [],
              studentsTaught: 0,
              averageRating: null,
              reviewCount: 0,
              totalEarnings: 0,
              approvalStatus: "PENDING",
              applicationSubmittedAt: timestamp,
            },
          ]
        : snapshot.instructors,
  });

  return user;
}

export function updateAdminDemoUser(userId: string, updates: UpdateUserInput) {
  const user = snapshot.users.find((item) => item.id === userId);
  if (!user) return false;
  const nextRole = updates.role ?? user.role;
  const nextStudents =
    nextRole === "STUDENT"
      ? snapshot.students.some((student) => student.userId === userId)
        ? snapshot.students
        : [
            ...snapshot.students,
            { userId, enrollments: [], certificates: [], lastActivityAt: null },
          ]
      : snapshot.students.filter((student) => student.userId !== userId);
  const nextInstructors =
    nextRole === "INSTRUCTOR"
      ? snapshot.instructors.some((instructor) => instructor.userId === userId)
        ? snapshot.instructors
        : [
            ...snapshot.instructors,
            {
              userId,
              specialization: "General",
              bio: "New demo instructor profile.",
              courses: [],
              studentsTaught: 0,
              averageRating: null,
              reviewCount: 0,
              totalEarnings: 0,
              approvalStatus: "PENDING" as const,
              applicationSubmittedAt: new Date().toISOString(),
            },
          ]
      : snapshot.instructors.filter((instructor) => instructor.userId !== userId);

  publish({
    ...snapshot,
    users: snapshot.users.map((item) =>
      item.id === userId
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item,
    ),
    students: nextStudents,
    instructors: nextInstructors,
  });
  return true;
}

export function removeAdminDemoUser(userId: string) {
  if (!snapshot.users.some((user) => user.id === userId)) return false;

  publish({
    ...snapshot,
    users: snapshot.users.filter((user) => user.id !== userId),
    students: snapshot.students.filter((student) => student.userId !== userId),
    instructors: snapshot.instructors.filter(
      (instructor) => instructor.userId !== userId,
    ),
  });
  return true;
}

export function updateAdminDemoInstructorApproval(
  userId: string,
  approvalStatus: InstructorApprovalStatus,
  rejectionReason?: string,
) {
  if (!snapshot.instructors.some((instructor) => instructor.userId === userId)) {
    return false;
  }

  publish({
    ...snapshot,
    instructors: snapshot.instructors.map((instructor) =>
      instructor.userId === userId
        ? { ...instructor, approvalStatus, rejectionReason }
        : instructor,
    ),
  });
  return true;
}
