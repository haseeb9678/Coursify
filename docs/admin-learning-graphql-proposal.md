# Admin learning module: proposed GraphQL API

The current Categories, Courses, Curriculum, and Course Approvals screens use a
deterministic, in-memory sample store. This document proposes a backend contract
for a future integration; none of these operations are currently sent to the
server. Keep the existing authenticated Admin Users API unchanged.

## Data relationships

- `CourseCategory` has many `Course` records. A course references one category.
- `Course` references an existing `User` as its instructor and has many ordered
  `CourseSection` records.
- `CourseSection` has many ordered `CourseLesson` records.
- `CourseLesson` has many `LessonResource` records.
- `Course` has many `CourseEnrollment` records and many `CourseReview` records.
- `CourseReview` references the existing authenticated `User` as reviewer.
- Course revenue and enrollment totals should be derived from authoritative
  enrollment/payment records, not accepted from admin input.

Use the existing authentication `User` and role types. Do not introduce a
second user model solely for learning management.

## Proposed enums and inputs

```graphql
enum CourseStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  PUBLISHED
  ARCHIVED
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum CategoryStatus {
  ACTIVE
  INACTIVE
}

enum CoursePricingType {
  FREE
  PAID
}

enum CourseSortField {
  TITLE
  CREATED_AT
  UPDATED_AT
  PRICE
  ENROLLMENT_COUNT
  STATUS
}

enum SortDirection {
  ASC
  DESC
}

enum LessonType {
  VIDEO
  TEXT
  PDF
}

enum CourseReviewDecision {
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

input CourseFiltersInput {
  search: String
  categoryId: ID
  instructorId: ID
  status: CourseStatus
  level: CourseLevel
  language: String
  pricingType: CoursePricingType
  sortBy: CourseSortField
  sortDirection: SortDirection
  page: Int = 1
  limit: Int = 20
}
```

Connection types should expose `items` plus page metadata (`page`, `limit`,
`total`, and `totalPages`). Category and curriculum inputs should mirror the
existing feature types while replacing client-only data URLs with durable media
references.

`CourseInput`, `CourseCategoryInput`, `CourseSectionInput`, and
`CourseLessonInput` should validate fields server-side. Prices should be integer
minor units with a currency code. Media uploads should use the existing
application upload/storage flow and return durable media IDs or URLs; do not
send browser data URLs as a production upload mechanism.

## Proposed queries

```graphql
type Query {
  courseCategories(
    status: CategoryStatus
    search: String
    page: Int = 1
    limit: Int = 50
  ): CourseCategoryConnection!

  adminCourses(filters: CourseFiltersInput!): CourseConnection!
  adminCourse(id: ID!): Course

  courseApprovals(
    search: String
    categoryId: ID
    status: CourseStatus
    submittedAfter: DateTime
    submittedBefore: DateTime
    page: Int = 1
    limit: Int = 20
  ): CourseConnection!
}
```

The course detail query should include its category, instructor, curriculum,
review history, and aggregate enrollment/rating values, with pagination for
potentially large nested collections.

## Proposed mutations

```graphql
type Mutation {
  createCourseCategory(input: CourseCategoryInput!): CourseCategory!
  updateCourseCategory(id: ID!, input: CourseCategoryInput!): CourseCategory!
  setCourseCategoryStatus(id: ID!, status: CategoryStatus!): CourseCategory!
  deleteCourseCategory(id: ID!): DeleteResult!

  createCourse(input: CourseInput!): Course!
  updateCourse(id: ID!, input: CourseInput!): Course!
  deleteDraftCourse(id: ID!): DeleteResult!
  submitCourseForReview(id: ID!): Course!
  publishApprovedCourse(id: ID!): Course!
  archivePublishedCourse(id: ID!): Course!

  createCourseSection(courseId: ID!, input: CourseSectionInput!): CourseSection!
  updateCourseSection(id: ID!, input: CourseSectionInput!): CourseSection!
  deleteCourseSection(id: ID!): DeleteResult!
  reorderCourseSections(courseId: ID!, sectionIds: [ID!]!): [CourseSection!]!

  createCourseLesson(sectionId: ID!, input: CourseLessonInput!): CourseLesson!
  updateCourseLesson(id: ID!, input: CourseLessonInput!): CourseLesson!
  deleteCourseLesson(id: ID!): DeleteResult!
  reorderCourseLessons(sectionId: ID!, lessonIds: [ID!]!): [CourseLesson!]!

  reviewCourse(
    courseId: ID!
    decision: CourseReviewDecision!
    feedback: String
    checklist: [String!]!
  ): CourseReview!
}
```

The server must derive the reviewer from the authenticated request rather than
trusting a client-supplied reviewer ID. It should enforce lifecycle transitions,
category deletion constraints, enrollment-aware course deletion rules, and
authorization on every mutation. Editing reviewed course content should return
the course to `DRAFT` and clear its submission timestamp.

## Integration boundary

When the backend is ready, replace the learning demo store with typed queries
and mutations behind feature-level hooks. Keep the sample notice until every
operation on a given screen is connected. Do not alter the existing Users API,
auth store, or role guard as part of that migration.
