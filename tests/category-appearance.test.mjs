import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const clientRoot = fileURLToPath(new URL("../", import.meta.url));
const modules = new Map();

// Run the feature's TypeScript modules using the project's compiler and path alias.
function loadTypeScript(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;

  const compiledModule = { exports: {} };
  modules.set(filename, compiledModule);
  const requirePackage = createRequire(filename);
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const execute = compileFunction(outputText, ["require", "exports", "module"], { filename });
  execute((specifier) => {
    if (specifier.startsWith("@/")) {
      return loadTypeScript(resolve(clientRoot, specifier.slice(2) + ".ts"));
    }
    if (specifier.startsWith(".")) {
      return loadTypeScript(resolve(dirname(filename), specifier + ".ts"));
    }
    return requirePackage(specifier);
  }, compiledModule.exports, compiledModule);
  return compiledModule.exports;
}

const load = (path) => loadTypeScript(resolve(clientRoot, "features", path + ".ts"));
const { CategoryIcon, categoryIconComponents, resolveCategoryIconName } = load("categories/category-icon-components");
const { categoryIconGroups, getRecommendedCategoryColors, searchCategoryIcons } =
  load("categories/category-icon-library");
const { categoryPalettes, getCategoryColorContrast, isCategoryHexColor, normalizeCategoryColor } =
  load("categories/category-colors");
const { getInitialCategoryAppearance, getCategoryAppearanceChanges } =
  load("categories/category-appearance");
const { categorySchema, getCategoryFormSchema } = load("admin/schemas/learning.schemas");

const icons = categoryIconGroups.flatMap(({ icons }) => icons);
const names = icons.map(({ name }) => name);
const renderIcon = (name) => renderToStaticMarkup(createElement(CategoryIcon, { name }));
const searchNames = (query, group = "") =>
  searchCategoryIcons(query, group).flatMap(({ icons }) => icons.map(({ name }) => name));

test("every curated icon resolves and renders; legacy and unknown names are safe", () => {
  assert.equal(categoryIconGroups.length, 15);
  assert.ok(names.length >= 80 && names.length <= 120);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(Object.keys(categoryIconComponents).sort(), [...names].sort());
  for (const name of names) {
    assert.equal(resolveCategoryIconName(name), name);
    assert.match(renderIcon(name), /<svg/);
  }
  assert.equal(resolveCategoryIconName("code"), "Code2");
  assert.equal(renderIcon("code"), renderIcon("Code2"));
  for (const name of ["removed-icon", "__proto__", "constructor"]) {
    assert.equal(resolveCategoryIconName(name), undefined);
    assert.equal(renderIcon(name), renderIcon("Code2"));
  }
});

const backendDto = resolve(clientRoot, "../server/src/modules/categories/dto/category.inputs.ts");
test("the frontend registry matches the backend allowlist", { skip: !existsSync(backendDto) }, () => {
  const source = readFileSync(backendDto, "utf8");
  const list = source.match(/export const CATEGORY_ICON_NAMES = \[([\s\S]*?)\] as const;/);
  assert.ok(list);
  const allowed = Array.from(list[1].matchAll(/'([^']+)'/g), ([, name]) => name);
  assert.deepEqual(allowed.sort(), [...names, "code"].sort());
});

test("search uses names, labels, keywords, group filters, and handles empty results", () => {
  for (const name of ["Megaphone", "Target", "TrendingUp", "ChartNoAxesColumn"]) {
    assert.ok(searchNames(" marketing ").includes(name));
  }
  for (const name of ["Code2", "Terminal", "Laptop", "Database"]) {
    assert.ok(searchNames("PROGRAMMING").includes(name));
  }
  assert.deepEqual(searchNames("ChartNoAxesColumn"), ["ChartNoAxesColumn"]);
  assert.deepEqual(searchNames("office building", "Business and Management"), ["Building2"]);
  assert.deepEqual(searchNames("office building", "Digital Marketing"), []);
  assert.deepEqual(searchNames("not-a-matching-icon"), []);
  assert.equal(searchNames("").length, names.length);
});

test("recommendations use stable palette overrides, group defaults and fallback", () => {
  assert.deepEqual(getRecommendedCategoryColors("Code2"), categoryPalettes.blue);
  assert.deepEqual(getRecommendedCategoryColors("Cloud"), categoryPalettes.teal);
  assert.deepEqual(getRecommendedCategoryColors("Smartphone"), categoryPalettes.cyan);
  assert.deepEqual(getRecommendedCategoryColors("Megaphone"), categoryPalettes.orange);
  assert.deepEqual(getRecommendedCategoryColors("code"), getRecommendedCategoryColors("Code2"));
  assert.deepEqual(getRecommendedCategoryColors("unknown"), getRecommendedCategoryColors("unknown"));
  for (const palette of Object.values(categoryPalettes)) {
    assert.ok(getCategoryColorContrast(palette) >= 3);
  }
});

test("color validation rejects unsupported input and preserves editable partial HEX", () => {
  const fields = { name: "Example", slug: "example", description: "Example description", status: "ACTIVE", imageDataUrl: null };
  const valid = { ...fields, ...getInitialCategoryAppearance() };
  assert.equal(categorySchema.safeParse(valid).success, true);
  assert.equal(categorySchema.safeParse({ ...valid, iconKey: "unknown" }).success, false);
  for (const value of ["#123", "#11223344", "#112233\n", "red", "var(--foo)", "url(javascript:foo)"]) {
    assert.equal(isCategoryHexColor(value), false);
    assert.equal(categorySchema.safeParse({ ...valid, iconColor: value }).success, false);
    assert.equal(categorySchema.safeParse({ ...valid, iconBackground: value }).success, false);
  }
  assert.equal(normalizeCategoryColor("#aabbcc"), "#AABBCC");
  assert.equal(normalizeCategoryColor("#aa"), "#aa");
  assert.equal(getCategoryColorContrast({ iconColor: "#111111", iconBackground: "#111111" }), 1);
});

test("saved values are restored exactly and omitted from updates unless changed", () => {
  const saved = { iconKey: "removed-icon", iconColor: "#aabbcc", iconBackground: "#001122" };
  assert.deepEqual(getInitialCategoryAppearance(saved), saved);
  assert.deepEqual(getCategoryAppearanceChanges(saved, saved), {});
  assert.deepEqual(getCategoryAppearanceChanges({ ...saved, iconKey: "Camera" }, saved), {
    iconName: "Camera",
  });
  assert.deepEqual(getCategoryAppearanceChanges({ ...saved, iconBackground: "#234567" }, saved), {
    iconBackground: "#234567",
  });
  assert.deepEqual(getInitialCategoryAppearance(), { iconKey: "Code2", ...categoryPalettes.blue });

  const historic = { ...saved, iconBackground: "legacy-color" };
  const values = { name: "Example", slug: "example", description: "Example description", status: "ACTIVE", imageDataUrl: null, ...historic };
  const editSchema = getCategoryFormSchema(historic);
  assert.deepEqual(editSchema.parse(values), values);
  assert.equal(editSchema.safeParse({ ...values, iconBackground: "another-color" }).success, false);
  assert.deepEqual(getCategoryAppearanceChanges(values, historic), {});
});
