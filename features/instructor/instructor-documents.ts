import { parse, print, visit, type FieldNode } from "graphql";

const documents = new Map<string, string>();
const instructorFields = new Set([
  "adminCourses", "adminCourse", "adminCourseCategoryOptions", "adminCreateCourse", "adminUpdateCourse",
  "adminDeleteCourse", "adminSubmitCourseForReview", "adminWithdrawCourseSubmission", "adminArchiveCourse", "adminRestoreCourse",
  "adminCourseCurriculum", "adminCreateCourseSection", "adminUpdateCourseSection", "adminDeleteCourseSection", "adminReorderCourseSections",
  "adminSaveCourseLesson", "adminDeleteCourseLesson", "adminReorderCourseLessons", "adminMoveCourseLesson",
  "adminCreateCourseLesson", "adminUpdateCourseLesson", "adminCreateLessonResource",
  "adminUpdateLessonResource", "adminDeleteLessonResource", "adminReorderLessonResources",
]);

export function instructorDocument(document: string) {
  const existing = documents.get(document);
  if (existing) return existing;
  function field(node: FieldNode): FieldNode | undefined {
    if (!instructorFields.has(node.name.value)) {
      if (node.name.value.startsWith("admin")) throw new Error("This action requires administrator access.");
      return;
    }
    return { ...node, alias: node.name, name: { ...node.name, value: node.name.value.replace(/^admin/, "instructor") } };
  }
  const result = print(visit(parse(document), {
    OperationDefinition(node) {
      const selections = node.selectionSet.selections.map((entry) => entry.kind === "Field" ? field(entry) ?? entry : entry);
      return { ...node, selectionSet: { ...node.selectionSet, selections } };
    },
    NamedType(node) {
      if (node.name.value !== "AdminCreateCourseInput" && node.name.value !== "AdminUpdateCourseInput") return;
      return { ...node, name: { ...node.name, value: node.name.value.replace(/^Admin/, "Instructor") } };
    },
  }));
  documents.set(document, result);
  return result;
}

