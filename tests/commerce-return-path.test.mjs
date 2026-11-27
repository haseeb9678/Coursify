import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../features/commerce/return-path.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { commerceLogin, enrollmentReturnPath } = await import(
  "data:text/javascript;base64," + Buffer.from(outputText).toString("base64")
);

const order = "d2514b36-6cd8-4934-ace2-aa74f13bea8e";

test("commerce login preserves the course and verified checkout return routes", () => {
  const allowed = ["/courses/learn-typescript", "/checkout/course-id", `/checkout/success?order=${order}&session_id=cs_test_fixture`];
  for (const path of allowed) {
    assert.equal(enrollmentReturnPath(path), path);
    assert.equal(new URL(commerceLogin(path), "https://example.test").searchParams.get("returnTo"), path);
  }
});

test("commerce login rejects external and malformed return URLs", () => {
  for (const path of [
    "https://example.test/courses/course-id", "//example.test", "/\\example.test", "/%2Fexample.test",
    "/courses/course-id?next=https://example.test", "/checkout/../login", "/admin/transactions",
    `/checkout/cancel?order=${order}&redirect=https://example.test`, `/checkout/success?order=${order}&session_id=cs_live_fixture`,
  ]) {
    assert.equal(enrollmentReturnPath(path), null, path);
    assert.equal(commerceLogin(path), "/login");
  }
});
