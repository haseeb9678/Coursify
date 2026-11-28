import assert from "node:assert/strict";
import { test } from "node:test";
import { isActiveRoute } from "../features/dashboard/utils/dashboard.utils.ts";
import { instructorDashboardConfig } from "../features/instructor/config.ts";

test("instructor course routes highlight one sidebar link", () => {
  const items = instructorDashboardConfig.navigationGroups.flatMap(({ items }) => items);
  for (const [pathname, expected] of [
    ["/instructor/courses", "/instructor/courses"],
    ["/instructor/courses/create/", "/instructor/courses/create"],
    ["/instructor/courses/drafts", "/instructor/courses/drafts"],
    ["/instructor/courses/example", "/instructor/courses"],
    ["/instructor/courses/example/edit", "/instructor/courses"],
    ["/instructor/courses/example/curriculum", "/instructor/courses"],
    ["/instructor/courses/example/students", "/instructor/courses"],
  ]) {
    assert.deepEqual(items.filter(({ href, activePaths, excludedPaths }) =>
      isActiveRoute(pathname, href, activePaths, excludedPaths)).map(({ href }) => href), [expected]);
  }
});

test("existing dashboard prefixes and route aliases continue to match", () => {
  assert.equal(isActiveRoute("/admin/courses/123/edit", "/admin/courses"), true);
  assert.equal(isActiveRoute("/student/learning/123", "/student/my-courses", ["/student/learning"]), true);
});
