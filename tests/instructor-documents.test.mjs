import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "graphql";
import { instructorDocument } from "../features/instructor/instructor-documents.ts";

test("reuses the shared course form shape with the instructor operation and input", () => {
  const document = instructorDocument("mutation Save($input:AdminCreateCourseInput!){ adminCreateCourse(input:$input){ course { id instructor { id } } } }");
  const operation = parse(document).definitions[0];
  const [field] = operation.selectionSet.selections;
  assert.equal(field.name.value, "instructorCreateCourse");
  assert.equal(field.alias.value, "adminCreateCourse");
  assert.equal(operation.variableDefinitions[0].type.type.name.value, "InstructorCreateCourseInput");
  assert.equal(field.selectionSet.selections[0].name.value, "course");
});

test("routes curriculum writes to instructor APIs and rejects admin-only actions", () => {
  assert.match(instructorDocument("mutation Save { adminSaveCourseLesson { success } }"), /adminSaveCourseLesson: instructorSaveCourseLesson/);
  assert.throws(() => instructorDocument("mutation Publish { adminPublishCourse { success } }"), /administrator access/);
  assert.throws(() => instructorDocument("query { adminUsers { total } }"), /administrator access/);
});
