import { gql } from "graphql-request";

const ADMIN_COURSE_FIELDS = gql`
  fragment AdminCourseFields on AdminCourse {
    id
    title
    slug
    shortDescription
    description
    thumbnailUrl
    promotionalVideoUrl
    category { id name slug }
    instructor { id name avatar }
    level
    language
    pricing { type currency priceMinorUnits discountedPriceMinorUnits }
    learningOutcomes
    requirements
    targetAudience
    status
    isFeatured
    canDelete
    sectionCount
    lessonCount
    submittedAt
    approvedAt
    publishedAt
    archivedAt
    createdAt
    updatedAt
  }
`;

const PUBLIC_COURSE_FIELDS = gql`
  fragment PublicCourseFields on PublicCourse {
    id
    title
    slug
    shortDescription
    description
    thumbnailUrl
    promotionalVideoUrl
    category { id name slug }
    instructor { id name avatar }
    level
    language
    pricing { type currency priceMinorUnits discountedPriceMinorUnits }
    learningOutcomes
    requirements
    targetAudience
  }
`;

const CATEGORY_FIELDS = gql`
  fragment AdminCategoryFields on AdminCategory {
    id
    name
    slug
    description
    iconName
    iconColor
    iconBackground
    imageUrl
    status
    courseCount
    createdAt
    updatedAt
  }
`;

export const ADMIN_CATEGORIES_QUERY = gql`
  ${CATEGORY_FIELDS}
  query AdminCategories(
    $pagination: PaginationInput!
    $filter: AdminCategoriesFilterInput
    $sort: AdminCategorySortInput
  ) {
    adminCategories(pagination: $pagination, filter: $filter, sort: $sort) {
      items { ...AdminCategoryFields }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const ADMIN_CATEGORY_STATS_QUERY = gql`
  query AdminCategoryStats {
    adminCategoryStats {
      totalCategories
      activeCategories
      inactiveCategories
      categorizedCourses
    }
  }
`;

export const ADMIN_CREATE_CATEGORY_MUTATION = gql`
  ${CATEGORY_FIELDS}
  mutation AdminCreateCategory($input: AdminCreateCategoryInput!) {
    adminCreateCategory(input: $input) {
      success
      message
      category { ...AdminCategoryFields }
    }
  }
`;

export const ADMIN_UPDATE_CATEGORY_MUTATION = gql`
  ${CATEGORY_FIELDS}
  mutation AdminUpdateCategory($input: AdminUpdateCategoryInput!) {
    adminUpdateCategory(input: $input) {
      success
      message
      category { ...AdminCategoryFields }
    }
  }
`;

export const ADMIN_UPDATE_CATEGORY_STATUS_MUTATION = gql`
  ${CATEGORY_FIELDS}
  mutation AdminUpdateCategoryStatus($input: AdminUpdateCategoryStatusInput!) {
    adminUpdateCategoryStatus(input: $input) {
      success
      message
      category { ...AdminCategoryFields }
    }
  }
`;

export const ADMIN_DELETE_CATEGORY_MUTATION = gql`
  mutation AdminDeleteCategory($id: ID!) {
    adminDeleteCategory(id: $id) { success message }
  }
`;

export const ADMIN_COURSES_QUERY = gql`
  ${ADMIN_COURSE_FIELDS}
  query AdminCourses(
    $pagination: PaginationInput!
    $filter: AdminCoursesFilterInput
    $sort: AdminCourseSortInput
  ) {
    adminCourses(pagination: $pagination, filter: $filter, sort: $sort) {
      items { ...AdminCourseFields }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const ADMIN_COURSE_QUERY = gql`
  ${ADMIN_COURSE_FIELDS}
  query AdminCourse($id: ID!) {
    adminCourse(id: $id) { ...AdminCourseFields }
  }
`;

export const ADMIN_COURSE_STATS_QUERY = gql`
  query AdminCourseStats {
    adminCourseStats {
      totalCourses draftCourses pendingReviewCourses approvedCourses
      rejectedCourses publishedCourses archivedCourses freeCourses paidCourses
    }
  }
`;

export const ADMIN_COURSE_INSTRUCTOR_OPTIONS_QUERY = gql`
  query AdminCourseInstructorOptions($search: String) {
    adminCourseInstructorOptions(search: $search) { id name avatar }
  }
`;

export const ADMIN_COURSE_CATEGORY_OPTIONS_QUERY = gql`
  query AdminCourseCategoryOptions($search: String) {
    adminCourseCategoryOptions(search: $search) { id name slug }
  }
`;

export const ADMIN_CREATE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminCreateCourse($input: AdminCreateCourseInput!) {
    adminCreateCourse(input: $input) {
      success message course { ...AdminCourseFields }
    }
  }
`;

export const ADMIN_UPDATE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminUpdateCourse($input: AdminUpdateCourseInput!) {
    adminUpdateCourse(input: $input) {
      success message course { ...AdminCourseFields }
    }
  }
`;

export const ADMIN_DELETE_COURSE_MUTATION = gql`
  mutation AdminDeleteCourse($id: ID!) {
    adminDeleteCourse(id: $id) { success message }
  }
`;

export const ADMIN_SUBMIT_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminSubmitCourseForReview($id: ID!) {
    adminSubmitCourseForReview(id: $id) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_WITHDRAW_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminWithdrawCourseSubmission($id: ID!) {
    adminWithdrawCourseSubmission(id: $id) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_PUBLISH_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminPublishCourse($id: ID!) {
    adminPublishCourse(id: $id) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_ARCHIVE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminArchiveCourse($id: ID!) {
    adminArchiveCourse(id: $id) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_RESTORE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminRestoreCourse($id: ID!, $expectedStatus: CourseStatus) {
    adminRestoreCourse(id: $id, expectedStatus: $expectedStatus) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_FEATURE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminUpdateCourseFeaturedStatus($input: AdminUpdateCourseFeaturedInput!) {
    adminUpdateCourseFeaturedStatus(input: $input) {
      success message course { ...AdminCourseFields }
    }
  }
`;

const CURRICULUM_FIELDS = gql`
  fragment CurriculumSectionFields on CourseSectionEntity {
    id courseId title description position createdAt updatedAt
    lessons {
      id sectionId title description type content videoUrl documentUrl videoAssetId documentAssetId
      durationSeconds position isPreview createdAt updatedAt
      videoQualities { height assetId }
      resources {
        id title type url fileName fileSize mediaAssetId position createdAt updatedAt
      }
    }
  }
`;

export const ADMIN_COURSE_CURRICULUM_QUERY = gql`
  ${CURRICULUM_FIELDS}
  query AdminCourseCurriculum($courseId: ID!) {
    adminCourseCurriculum(courseId: $courseId) {
      courseId
      sections { ...CurriculumSectionFields }
    }
  }
`;

export const ADMIN_COURSE_CURRICULUM_STATS_QUERY = gql`
  query AdminCourseCurriculumStats($courseId: ID!) {
    adminCourseCurriculumStats(courseId: $courseId) {
      totalSections totalLessons totalVideoLessons totalTextLessons
      totalPdfLessons totalDurationSeconds totalPreviewLessons
    }
  }
`;

export const ADMIN_CREATE_SECTION_MUTATION = gql`
  ${CURRICULUM_FIELDS}
  mutation AdminCreateCourseSection($input: AdminCreateCourseSectionInput!) {
    adminCreateCourseSection(input: $input) {
      success message section { ...CurriculumSectionFields }
    }
  }
`;

export const ADMIN_UPDATE_SECTION_MUTATION = gql`
  ${CURRICULUM_FIELDS}
  mutation AdminUpdateCourseSection($input: AdminUpdateCourseSectionInput!) {
    adminUpdateCourseSection(input: $input) {
      success message section { ...CurriculumSectionFields }
    }
  }
`;

export const ADMIN_DELETE_SECTION_MUTATION = gql`
  mutation AdminDeleteCourseSection($id: ID!) {
    adminDeleteCourseSection(id: $id) { success message }
  }
`;

export const ADMIN_REORDER_SECTIONS_MUTATION = gql`
  mutation AdminReorderCourseSections($input: AdminReorderCourseSectionsInput!) {
    adminReorderCourseSections(input: $input) { success message }
  }
`;

export const ADMIN_CREATE_LESSON_MUTATION = gql`
  mutation AdminCreateCourseLesson($input: AdminCreateCourseLessonInput!) {
    adminCreateCourseLesson(input: $input) {
      success message lesson {
        id sectionId title description type content videoUrl documentUrl videoAssetId documentAssetId
        durationSeconds position isPreview createdAt updatedAt
        resources { id title type url fileName fileSize mediaAssetId position createdAt updatedAt }
      }
    }
  }
`;

export const ADMIN_SAVE_LESSON_MUTATION = `
  mutation AdminSaveCourseLesson($input: AdminSaveCourseLessonInput!) {
    adminSaveCourseLesson(input: $input) {
      success message
      lesson {
        id sectionId title description type content videoUrl documentUrl videoAssetId documentAssetId durationSeconds position isPreview createdAt updatedAt
        videoQualities { height assetId }
        resources { id title type url fileName fileSize mediaAssetId position createdAt updatedAt }
      }
    }
  }
`;

export const ADMIN_UPDATE_LESSON_MUTATION = gql`
  mutation AdminUpdateCourseLesson($input: AdminUpdateCourseLessonInput!) {
    adminUpdateCourseLesson(input: $input) {
      success message lesson { id sectionId title description type content videoUrl documentUrl videoAssetId documentAssetId durationSeconds position isPreview createdAt updatedAt }
    }
  }
`;

export const ADMIN_DELETE_LESSON_MUTATION = gql`
  mutation AdminDeleteCourseLesson($id: ID!) {
    adminDeleteCourseLesson(id: $id) { success message }
  }
`;

export const ADMIN_REORDER_LESSONS_MUTATION = gql`
  mutation AdminReorderCourseLessons($input: AdminReorderCourseLessonsInput!) {
    adminReorderCourseLessons(input: $input) { success message }
  }
`;

export const ADMIN_MOVE_LESSON_MUTATION = gql`
  mutation AdminMoveCourseLesson($input: AdminMoveCourseLessonInput!) {
    adminMoveCourseLesson(input: $input) { success message }
  }
`;

export const ADMIN_CREATE_RESOURCE_MUTATION = gql`
  mutation AdminCreateLessonResource($input: AdminCreateLessonResourceInput!) {
    adminCreateLessonResource(input: $input) {
      success message resource { id title type url fileName fileSize mediaAssetId position createdAt updatedAt }
    }
  }
`;

export const ADMIN_UPDATE_RESOURCE_MUTATION = gql`
  mutation AdminUpdateLessonResource($input: AdminUpdateLessonResourceInput!) {
    adminUpdateLessonResource(input: $input) {
      success message resource { id title type url fileName fileSize mediaAssetId position createdAt updatedAt }
    }
  }
`;

export const ADMIN_DELETE_RESOURCE_MUTATION = gql`
  mutation AdminDeleteLessonResource($id: ID!) {
    adminDeleteLessonResource(id: $id) { success message }
  }
`;

export const ADMIN_REORDER_RESOURCES_MUTATION = gql`
  mutation AdminReorderLessonResources($input: AdminReorderLessonResourcesInput!) {
    adminReorderLessonResources(input: $input) { success message }
  }
`;

export const ADMIN_COURSE_APPROVALS_QUERY = gql`
  ${ADMIN_COURSE_FIELDS}
  query AdminCourseApprovals($pagination: PaginationInput!, $filter: AdminCourseApprovalsFilterInput) {
    adminCourseApprovals(pagination: $pagination, filter: $filter) {
      items { ...AdminCourseFields }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const ADMIN_COURSE_APPROVAL_STATS_QUERY = gql`
  query AdminCourseApprovalStats {
    adminCourseApprovalStats { pendingReviews approvedCourses rejectedCourses reviewedThisMonth }
  }
`;

export const ADMIN_COURSE_APPROVAL_DETAILS_QUERY = gql`
  ${ADMIN_COURSE_FIELDS}
  query AdminCourseApprovalDetails($courseId: ID!) {
    adminCourseApprovalDetails(courseId: $courseId) {
      course { ...AdminCourseFields }
      readinessErrors
      recentReviews {
        id courseId reviewer { id name } decision feedback previousStatus newStatus createdAt
      }
    }
  }
`;

export const ADMIN_COURSE_REVIEW_HISTORY_QUERY = gql`
  query AdminCourseReviewHistory($courseId: ID!, $pagination: PaginationInput!) {
    adminCourseReviewHistory(courseId: $courseId, pagination: $pagination) {
      items {
        id courseId reviewer { id name } decision feedback previousStatus newStatus createdAt
      }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const ADMIN_APPROVE_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminApproveCourse($input: AdminApproveCourseInput!) {
    adminApproveCourse(input: $input) { success message course { ...AdminCourseFields } }
  }
`;

export const ADMIN_REJECT_COURSE_MUTATION = gql`
  ${ADMIN_COURSE_FIELDS}
  mutation AdminRejectCourse($input: AdminRejectCourseInput!) {
    adminRejectCourse(input: $input) { success message course { ...AdminCourseFields } }
  }
`;

export const PUBLIC_CATEGORIES_QUERY = gql`
  query Categories($pagination: PaginationInput!, $search: String) {
    categories(pagination: $pagination, search: $search) {
      items { id name slug description iconName iconBackground iconColor imageUrl courseCount }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const PUBLIC_COURSES_QUERY = gql`
  ${PUBLIC_COURSE_FIELDS}
  query Courses($pagination: PaginationInput!, $filter: AdminCoursesFilterInput) {
    courses(pagination: $pagination, filter: $filter) {
      items { ...PublicCourseFields }
      meta { page limit total totalPages hasNext hasPrevious }
    }
  }
`;

export const PUBLIC_COURSE_QUERY = gql`
  ${PUBLIC_COURSE_FIELDS}
  query Course($identifier: String!) {
    course(identifier: $identifier) {
      ...PublicCourseFields
      updatedAt
      curriculum { title lessons { title durationSeconds isPreview resourceCount previewLessonId } }
    }
  }
`;

export const PUBLIC_FEATURED_COURSES_QUERY = gql`
  ${PUBLIC_COURSE_FIELDS}
  query FeaturedCourses($limit: Int!) {
    featuredCourses(limit: $limit) { ...PublicCourseFields }
  }
`;

export const PUBLIC_RELATED_COURSES_QUERY = gql`
  ${PUBLIC_COURSE_FIELDS}
  query RelatedCourses($courseId: ID!, $limit: Int!) {
    relatedCourses(courseId: $courseId, limit: $limit) { ...PublicCourseFields }
  }
`;
