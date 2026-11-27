import { formatLearningDuration } from "@/features/admin/utils/learning.utils";
import { getPublicCourse } from "@/features/courses/api/public-courses.api";
import type { PublicCourse } from "@/features/courses/types/public-api.types";
import { getGraphQLErrorCode } from "@/lib/graphql/error";

export interface CourseLesson {
  title: string;
  duration: string;
  preview?: boolean;
  previewLessonId?: string | null;
}

export interface CourseModule {
  title: string;
  duration: string;
  lessons: CourseLesson[];
}

export interface CourseReview {
  name: string;
  role: string;
  rating: number;
  comment: string;
}

export interface CourseDetails {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  previewImage: string | null;
  previewVideoUrl: string | null;
  instructor: {
    name: string;
    role: string;
    image: string | null;
    bio?: string;
    rating?: number;
    students?: string;
    courses?: number;
  };
  rating?: number;
  reviewCount?: number;
  students?: string;
  pricing: PublicCourse["pricing"];
  updatedAt: string;
  bestseller?: boolean;
  duration: string | null;
  lessonsCount: number;
  resources: number;
  certificate?: boolean;
  learningOutcomes: string[];
  modules: CourseModule[];
  reviews: CourseReview[];
}

function formatDuration(seconds: number): string {
  return seconds > 0 && seconds < 60 ? `${seconds} sec` : formatLearningDuration(seconds);
}

function getPreviewUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function getCourseById(identifier: string): Promise<CourseDetails | null> {
  const course = await getPublicCourse(identifier).catch((error: unknown) => {
    if (getGraphQLErrorCode(error) === "NOT_FOUND") return null;
    throw error;
  });
  if (!course) return null;

  let totalDuration = 0;
  let lessonsCount = 0;
  let resources = 0;
  const modules = (course.curriculum ?? []).map((section) => {
    let sectionDuration = 0;
    const lessons = section.lessons.map((lesson) => {
      sectionDuration += lesson.durationSeconds ?? 0;
      lessonsCount += 1;
      resources += lesson.resourceCount;
      return {
        title: lesson.title,
        duration: lesson.durationSeconds === null ? "Not listed" : formatDuration(lesson.durationSeconds),
        preview: lesson.isPreview,
        previewLessonId: lesson.previewLessonId,
      };
    });
    totalDuration += sectionDuration;
    return {
      title: section.title,
      duration: sectionDuration ? formatDuration(sectionDuration) : "Not listed",
      lessons,
    };
  });

  return {
    id: course.id,
    title: course.title,
    subtitle: course.shortDescription,
    description: course.description,
    category: course.category.name,
    level: course.level.toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
    previewImage: course.thumbnailUrl,
    previewVideoUrl: getPreviewUrl(course.promotionalVideoUrl),
    instructor: { name: course.instructor.name, role: "Instructor", image: course.instructor.avatar },
    pricing: course.pricing,
    updatedAt: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(course.updatedAt)),
    duration: totalDuration ? formatDuration(totalDuration) : null,
    lessonsCount,
    resources,
    learningOutcomes: course.learningOutcomes,
    modules,
    reviews: [],
  };
}
