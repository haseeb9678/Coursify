import { sampleAdminInstructors } from "@/features/admin/data/instructors.data";
import type {
  AdminCategory,
  AdminCourse,
  CourseLesson,
  CourseReview,
  CourseSection,
} from "@/features/admin/types/learning.types";

const sampleDate = (month: number, day: number) =>
  new Date(Date.UTC(2026, month, day, 12)).toISOString();

export const initialLearningCategories: AdminCategory[] = [
  {
    id: "category-web-development",
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and full-stack web application skills.",
    status: "ACTIVE",
    iconKey: "code",
    imageDataUrl: null,
    createdAt: sampleDate(0, 5),
    updatedAt: sampleDate(0, 5),
  },
  {
    id: "category-mobile-development",
    name: "Mobile App Development",
    slug: "mobile-app-development",
    description: "Build applications for iOS, Android, and cross-platform devices.",
    status: "ACTIVE",
    iconKey: "mobile",
    imageDataUrl: null,
    createdAt: sampleDate(0, 8),
    updatedAt: sampleDate(0, 8),
  },
  {
    id: "category-data-science",
    name: "Data Science",
    slug: "data-science",
    description: "Data analysis, visualization, statistics, and machine learning.",
    status: "ACTIVE",
    iconKey: "data",
    imageDataUrl: null,
    createdAt: sampleDate(0, 12),
    updatedAt: sampleDate(0, 12),
  },
  {
    id: "category-artificial-intelligence",
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Applied AI, generative models, and responsible automation.",
    status: "ACTIVE",
    iconKey: "ai",
    imageDataUrl: null,
    createdAt: sampleDate(0, 18),
    updatedAt: sampleDate(0, 18),
  },
  {
    id: "category-cybersecurity",
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Security fundamentals, defensive practices, and risk management.",
    status: "ACTIVE",
    iconKey: "security",
    imageDataUrl: null,
    createdAt: sampleDate(1, 2),
    updatedAt: sampleDate(1, 2),
  },
  {
    id: "category-cloud-computing",
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "Cloud infrastructure, deployment, and platform operations.",
    status: "ACTIVE",
    iconKey: "cloud",
    imageDataUrl: null,
    createdAt: sampleDate(1, 7),
    updatedAt: sampleDate(1, 7),
  },
  {
    id: "category-ui-ux-design",
    name: "UI/UX Design",
    slug: "ui-ux-design",
    description: "User research, interaction design, prototyping, and design systems.",
    status: "ACTIVE",
    iconKey: "design",
    imageDataUrl: null,
    createdAt: sampleDate(1, 10),
    updatedAt: sampleDate(1, 10),
  },
  {
    id: "category-software-engineering",
    name: "Software Engineering",
    slug: "software-engineering",
    description: "Architecture, testing, collaboration, and software delivery.",
    status: "ACTIVE",
    iconKey: "software",
    imageDataUrl: null,
    createdAt: sampleDate(1, 15),
    updatedAt: sampleDate(1, 15),
  },
  {
    id: "category-business",
    name: "Business and Management",
    slug: "business-management",
    description: "Leadership, product strategy, operations, and entrepreneurship.",
    status: "ACTIVE",
    iconKey: "business",
    imageDataUrl: null,
    createdAt: sampleDate(2, 1),
    updatedAt: sampleDate(2, 1),
  },
  {
    id: "category-digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    description: "Content, analytics, search, and campaign strategy.",
    status: "ACTIVE",
    iconKey: "marketing",
    imageDataUrl: null,
    createdAt: sampleDate(2, 6),
    updatedAt: sampleDate(2, 6),
  },
  {
    id: "category-programming-fundamentals",
    name: "Programming Fundamentals",
    slug: "programming-fundamentals",
    description: "Core programming concepts for new and developing learners.",
    status: "INACTIVE",
    iconKey: "fundamentals",
    imageDataUrl: null,
    createdAt: sampleDate(2, 11),
    updatedAt: sampleDate(2, 11),
  },
  {
    id: "category-devops",
    name: "DevOps",
    slug: "devops",
    description: "Build, release, and operate reliable software systems.",
    status: "ACTIVE",
    iconKey: "devops",
    imageDataUrl: null,
    createdAt: sampleDate(2, 16),
    updatedAt: sampleDate(2, 16),
  },
];

const courseDefinitions = [
  ["Complete React Development", "category-web-development", "PUBLISHED"],
  ["Next.js Full Stack Development", "category-web-development", "PENDING_REVIEW"],
  ["NestJS Backend Development", "category-software-engineering", "DRAFT"],
  ["Python for Data Science", "category-data-science", "APPROVED"],
  ["AWS Cloud Fundamentals", "category-cloud-computing", "PUBLISHED"],
  ["Modern UI/UX Design", "category-ui-ux-design", "PUBLISHED"],
  ["Ethical Hacking Fundamentals", "category-cybersecurity", "REJECTED"],
  ["Android App Development", "category-mobile-development", "DRAFT"],
  ["TypeScript Masterclass", "category-web-development", "PUBLISHED"],
  ["Docker and Kubernetes", "category-devops", "PENDING_REVIEW"],
  ["Practical Machine Learning", "category-artificial-intelligence", "APPROVED"],
  ["Product Management Essentials", "category-business", "PUBLISHED"],
  ["Search Engine Optimization", "category-digital-marketing", "DRAFT"],
  ["Secure Software Design", "category-cybersecurity", "PENDING_REVIEW"],
  ["JavaScript Programming Foundations", "category-programming-fundamentals", "PUBLISHED"],
  ["Cloud-Native Application Design", "category-cloud-computing", "REJECTED"],
  ["Mobile UX Research", "category-ui-ux-design", "DRAFT"],
  ["Data Visualization with Python", "category-data-science", "PUBLISHED"],
  ["AI Product Prototyping", "category-artificial-intelligence", "PENDING_REVIEW"],
  ["Software Testing Strategies", "category-software-engineering", "ARCHIVED"],
  ["Cross-Platform App Development", "category-mobile-development", "APPROVED"],
  ["Content Marketing Workshop", "category-digital-marketing", "PUBLISHED"],
  ["Infrastructure as Code", "category-devops", "DRAFT"],
  ["Startup Operations", "category-business", "PENDING_REVIEW"],
  ["Programming with Python", "category-programming-fundamentals", "REJECTED"],
] as const;

if (sampleAdminInstructors.length === 0) {
  throw new Error("Learning sample data requires at least one sample instructor.");
}

export const initialLearningCourses: AdminCourse[] = courseDefinitions.map(
  ([title, categoryId, status], index) => {
    const createdAt = sampleDate(index % 10, (index % 26) + 1);
    const updatedAt = sampleDate((index + 2) % 10, ((index + 8) % 26) + 1);
    const isFree = index % 7 === 0;
    const priceMinorUnits = 2400 + ((index * 1375) % 8400);

    return {
      id: `course-${String(index + 1).padStart(3, "0")}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""),
      shortDescription: `A practical, project-focused course covering ${title.toLowerCase()}.`,
      description: `${title} combines clear explanations with guided practice. Learners build confidence through a structured curriculum, practical examples, and focused activities that connect core ideas to real-world work.`,
      categoryId,
      instructorId:
        sampleAdminInstructors[index % sampleAdminInstructors.length].userId,
      level: (["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const)[index % 3],
      language: index % 5 === 0 ? "Spanish" : "English",
      thumbnailDataUrl: null,
      promotionalVideoUrl: "",
      pricing: {
        type: isFree ? "FREE" : "PAID",
        currency: "USD",
        priceMinorUnits: isFree ? 0 : priceMinorUnits,
        discountedPriceMinorUnits:
          !isFree && index % 4 === 0 ? Math.floor(priceMinorUnits * 0.8) : null,
      },
      learningOutcomes: [
        `Apply core ${title.toLowerCase()} concepts to practical projects`,
        "Plan a clear workflow and evaluate the results",
        "Use established practices to improve the quality of your work",
      ],
      requirements: ["Basic computer skills", "Willingness to practice"],
      targetAudience: [
        "Learners building practical professional skills",
        "Developers and career changers seeking structured guidance",
      ],
      status,
      enrollmentCount:
        status === "PUBLISHED" ? 85 + ((index * 79) % 2100) : 0,
      averageRating:
        status === "PUBLISHED" && index % 3 !== 0
          ? Number((4.1 + (index % 9) / 10).toFixed(1))
          : null,
      createdAt,
      updatedAt,
      submittedAt:
        status === "DRAFT"
          ? null
          : sampleDate((index + 3) % 10, ((index + 12) % 26) + 1),
    };
  },
);

const sectionTitles = ["Course foundations", "Applied workshop"];
const lessonTitles = [
  ["Course orientation", "Understand the foundations", "Practice with an example"],
  ["Plan a practical solution", "Build the main workflow", "Review and improve"],
];

export const initialLearningSections: CourseSection[] =
  initialLearningCourses.flatMap((course) =>
    sectionTitles.map((title, sectionIndex) => {
      const id = `section-${course.id}-${sectionIndex + 1}`;
      const createdAt = course.createdAt;

      return {
        id,
        courseId: course.id,
        title,
        description:
          sectionIndex === 0
            ? "Introduce the key concepts and establish a practical foundation."
            : "Apply the concepts through a guided, job-relevant project.",
        position: sectionIndex + 1,
        createdAt,
        updatedAt: course.updatedAt,
      };
    }),
  );

export const initialLearningLessons: CourseLesson[] =
  initialLearningSections.flatMap((section) => {
    const courseNumber = Number(section.courseId.slice(-3));
    const courseIndex = courseNumber - 1;
    const titleSet = lessonTitles[section.position - 1];

    return titleSet.map((title, lessonIndex) => {
      const type = (["VIDEO", "TEXT", "PDF"] as const)[lessonIndex];
      const durationSeconds = type === "PDF" ? null : 360 + courseIndex * 17;

      return {
        id: `lesson-${section.id}-${lessonIndex + 1}`,
        sectionId: section.id,
        title: `${title} ${section.position}.${lessonIndex + 1}`,
        description:
          "A focused lesson with examples and clear next steps for independent practice.",
        type,
        durationSeconds,
        position: lessonIndex + 1,
        isPreview: section.position === 1 && lessonIndex === 0,
        content:
          type === "TEXT"
            ? "Start by identifying the goal, break the work into clear steps, and test each idea with a small example. Use the notes in this lesson as a reference while you practice."
            : "",
        mediaUrl: "",
        resources:
          lessonIndex === 2
            ? [
                {
                  id: `resource-${section.id}-${lessonIndex + 1}`,
                  title: "MDN learning reference",
                  type: "LINK",
                  url: "https://developer.mozilla.org/",
                },
              ]
            : [],
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      };
    });
  });

export const initialLearningReviews: CourseReview[] = [
  {
    id: "review-course-002-1",
    courseId: "course-002",
    reviewerId: "sample-admin-reviewer",
    decision: "CHANGES_REQUESTED",
    feedback: "Add more detail to the project section and clarify the intended audience.",
    checklist: ["course-info", "thumbnail", "pricing", "curriculum", "lessons"],
    createdAt: sampleDate(9, 18),
  },
  {
    id: "review-course-004-1",
    courseId: "course-004",
    reviewerId: "sample-admin-reviewer",
    decision: "APPROVED",
    feedback: "The course structure and learning outcomes are ready for publication.",
    checklist: ["course-info", "thumbnail", "pricing", "curriculum", "lessons", "outcomes", "category"],
    createdAt: sampleDate(9, 20),
  },
  {
    id: "review-course-007-1",
    courseId: "course-007",
    reviewerId: "sample-admin-reviewer",
    decision: "REJECTED",
    feedback: "Please add a complete curriculum and use a clearer course thumbnail.",
    checklist: ["course-info", "pricing", "category"],
    createdAt: sampleDate(9, 22),
  },
  {
    id: "review-course-011-1",
    courseId: "course-011",
    reviewerId: "sample-admin-reviewer",
    decision: "APPROVED",
    feedback: "The learning outcomes and lesson sequence are clear.",
    checklist: ["course-info", "thumbnail", "pricing", "curriculum", "lessons", "outcomes", "category"],
    createdAt: sampleDate(10, 4),
  },
  {
    id: "review-course-016-1",
    courseId: "course-016",
    reviewerId: "sample-admin-reviewer",
    decision: "REJECTED",
    feedback: "Clarify the course requirements and provide complete lesson descriptions.",
    checklist: ["course-info", "thumbnail", "pricing", "category"],
    createdAt: sampleDate(10, 8),
  },
  {
    id: "review-course-021-1",
    courseId: "course-021",
    reviewerId: "sample-admin-reviewer",
    decision: "APPROVED",
    feedback: "The course is organized and ready for publication.",
    checklist: ["course-info", "thumbnail", "pricing", "curriculum", "lessons", "outcomes", "category"],
    createdAt: sampleDate(10, 12),
  },
];
