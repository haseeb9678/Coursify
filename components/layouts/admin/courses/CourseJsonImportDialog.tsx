"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import { Button } from "@/components/ui/button";
import { resolveCourseImportReferences } from "@/features/admin/api/course-json-import.api";
import type { CategoryOption, InstructorOption } from "@/features/admin/types/learning-api.types";
import type { CourseFormInput } from "@/features/admin/types/learning.types";
import {
  COURSE_JSON_SAMPLE, MAX_COURSE_JSON_LENGTH, createCourseImportPlan, fieldLabels, parseCourseJson, readJson,
  type CourseImportPlan, type CourseReferences, type FormField, type ImportCourse, type ImportMode,
} from "@/features/admin/utils/course-json-import";

const template = JSON.stringify(COURSE_JSON_SAMPLE, null, 2);
const instructorTemplate = JSON.stringify({
  ...Object.fromEntries(Object.entries(COURSE_JSON_SAMPLE).filter(([key]) => key !== "instructorName")),
  curriculum: [{ title: "Introduction", lessons: [{ title: "Welcome", type: "TEXT", content: "Welcome to your first lesson." }] }],
}, null, 2);

interface Snapshot {
  values: CourseFormInput;
  isDirty: (field: FormField) => boolean;
  customSlug: boolean;
  curriculum?: string;
}

interface Preview {
  course: ImportCourse;
  references: CourseReferences;
  unknown: string[];
  plan: CourseImportPlan;
  signature: string;
}

function makePreview(
  course: ImportCourse, references: CourseReferences, unknown: string[], snapshot: Snapshot, mode: ImportMode,
): Preview {
  const plan = createCourseImportPlan(course, snapshot.values, snapshot.isDirty, snapshot.customSlug, references, mode, snapshot.curriculum);
  const signature = JSON.stringify([plan, plan.fields.map(({ name }) => snapshot.values[name]), snapshot.curriculum]);
  return { course, references, unknown, plan, signature };
}

export default function CourseJsonImportDialog({
  categories, instructors, availability, optionsLoading, getSnapshot, onApply, onClose, instructor = false,
}: {
  categories: readonly CategoryOption[];
  instructors: readonly InstructorOption[];
  availability: { categories: boolean; instructors: boolean };
  optionsLoading: boolean;
  instructor?: boolean;
  getSnapshot: () => Snapshot;
  onApply: (plan: CourseImportPlan, explicitSlug: boolean) => void;
  onClose: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<ImportMode>("fill");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirming, setConfirming] = useState(false);
  const overwrite = preview?.plan.fields.filter(({ kind }) => kind === "overwrite") ?? [];
  const sample = instructor ? instructorTemplate : template;

  const close = () => {
    request.current += 1;
    onClose();
  };

  const changeSource = (next: string) => {
    request.current += 1;
    setSource(next);
    setBusy(false);
    setErrors([]);
    setUnknown([]);
    setPreview(null);
    setConfirming(false);
  };

  const validate = async () => {
    if (busy || optionsLoading) return;
    const parsed = parseCourseJson(source, instructor);
    setErrors(parsed.errors);
    setUnknown(parsed.unknown);
    setPreview(null);
    if (!parsed.course) return;
    const revision = ++request.current;
    setBusy(true);
    try {
      const references = await resolveCourseImportReferences(parsed.course, categories, instructors, availability, instructor);
      if (request.current === revision) {
        setPreview(makePreview(parsed.course, references, parsed.unknown, getSnapshot(), mode));
      }
    } catch {
      if (request.current === revision) setErrors(["The import preview could not be prepared. Try validating again."]);
    } finally {
      if (request.current === revision) setBusy(false);
    }
  };

  const changeMode = (next: ImportMode) => {
    if (busy || next === mode) return;
    setMode(next);
    setConfirming(false);
    if (preview) setPreview(makePreview(preview.course, preview.references, preview.unknown, getSnapshot(), next));
  };

  const apply = (confirmed = false) => {
    if (!preview) return;
    const next = makePreview(preview.course, preview.references, preview.unknown, getSnapshot(), mode);
    if (next.signature !== preview.signature) {
      setPreview(next);
      setConfirming(false);
      toast.info("The form changed. Review the updated preview before importing.");
      return;
    }
    if (next.plan.errors.length || (!Object.keys(next.plan.patch).length && !next.plan.curriculum)) return;
    if (!confirmed && (next.plan.fields.some(({ kind }) => kind === "overwrite") || next.plan.curriculumChange === "overwrite")) {
      setConfirming(true);
      return;
    }
    onApply(next.plan, next.course.slug !== undefined);
    toast.success("Course data imported into the form.");
    close();
  };

  async function loadFile(file: File) {
    const revision = ++request.current;
    setBusy(true);
    try {
      if (!/\.json$/i.test(file.name) || file.size > MAX_COURSE_JSON_LENGTH * 4) throw new Error("Choose a JSON file within the import limit.");
      const data = await file.text();
      if (data.length > MAX_COURSE_JSON_LENGTH) throw new Error("Use at most 65,536 characters of JSON.");
      if (request.current === revision) changeSource(data.replace(/^\uFEFF/, ""));
    } catch (failure) {
      if (request.current === revision) {
        setPreview(null);
        setErrors([failure instanceof Error ? failure.message : "The JSON file could not be read."]);
      }
    } finally {
      if (request.current === revision) setBusy(false);
    }
  }

  return (
    <>
      <AdminDialog open size="lg" title="Import Course Data"
        description="Paste your course data in JSON format to automatically populate the course creation form."
        onOpenChange={(open) => { if (!open) close(); }}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" variant="outline" busy={busy} disabled={optionsLoading} onClick={() => void validate()}>Validate JSON</Button>
            <Button type="button" disabled={!preview || Boolean(preview.plan.errors.length) || (!Object.keys(preview.plan.patch).length && !preview.plan.curriculum)}
              onClick={() => apply()}>Import &amp; Fill Form</Button>
          </div>
        }>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={async () => {
              try {
                await navigator.clipboard.writeText(sample);
                toast.success("JSON template copied.");
              } catch {
                toast.error("Clipboard unavailable. Load the sample to copy it manually.");
              }
            }}>Copy JSON Template</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => changeSource(sample)}>Load Sample Data</Button>
            {instructor && <>
              <input ref={input} type="file" accept=".json,application/json" hidden onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void loadFile(file);
              }} />
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>Choose JSON file</Button>
            </>}
            <Button type="button" size="sm" variant="outline" disabled={!source.trim()} onClick={() => {
              const parsed = readJson(source);
              if ("error" in parsed) {
                request.current += 1;
                setBusy(false);
                setPreview(null);
                setUnknown([]);
                setErrors([parsed.error]);
                return;
              }
              try {
                const formatted = JSON.stringify(parsed.value, null, 2);
                if (formatted.length > MAX_COURSE_JSON_LENGTH) {
                  setErrors(["The formatted JSON exceeds the import limit."]);
                  return;
                }
                changeSource(formatted);
              } catch {
                setErrors(["The JSON is too deeply nested to format."]);
              }
            }}>Format JSON</Button>
            <Button type="button" size="sm" variant="ghost" disabled={!source} onClick={() => changeSource("")}>Clear</Button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={id} className="block text-xs font-medium text-brand-text">Course JSON</label>
            <textarea id={id} value={source} onChange={(event) => changeSource(event.target.value)}
              rows={12} spellCheck={false} maxLength={MAX_COURSE_JSON_LENGTH}
              onPaste={(event) => {
                const selected = event.currentTarget.selectionEnd - event.currentTarget.selectionStart;
                if (source.length - selected + event.clipboardData.getData("text").length > MAX_COURSE_JSON_LENGTH) {
                  event.preventDefault();
                  request.current += 1;
                  setBusy(false);
                  setPreview(null);
                  setUnknown([]);
                  setErrors(["Use at most 65,536 characters of JSON."]);
                }
              }}
              placeholder={'{\n  "title": "JavaScript Fundamentals",\n  "level": "BEGINNER"\n}'}
              aria-invalid={Boolean(errors.length || preview?.plan.errors.length)}
              aria-describedby={`${id}-help`}
              className="min-h-56 w-full resize-y rounded-xl border border-brand-border bg-background p-3 font-mono text-sm text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <p id={`${id}-help`} className="text-xs text-brand-text-muted">
              Use one course object. Prices are in USD. Validate to preview the changes before applying them.
            </p>
          </div>

          <fieldset className="flex flex-wrap gap-4 text-sm text-brand-text">
            <legend className="mb-2 text-xs font-medium">Import mode</legend>
            {(["fill", "overwrite"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input type="radio" name={`${id}-mode`} checked={mode === option} disabled={busy}
                  onChange={() => changeMode(option)} className="accent-primary" />
                {option === "fill" ? "Fill Empty Fields" : "Overwrite Imported Fields"}
              </label>
            ))}
          </fieldset>

          {optionsLoading && <p role="status" className="text-xs text-brand-text-muted">Loading category and instructor options?</p>}
          {unknown.length > 0 && <p role="status" className="break-words text-xs text-brand-text-muted">Unsupported fields will be ignored: {unknown.join(", ")}.</p>}
          {(errors.length > 0 || Boolean(preview?.plan.errors.length)) && (
            <ul role="alert" className="list-inside list-disc space-y-1 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
              {[...errors, ...(preview?.plan.errors ?? [])].map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          )}
          {preview && <ImportPreview preview={preview} />}
        </div>
      </AdminDialog>
      <AdminConfirmDialog open={confirming} onOpenChange={setConfirming} title="Overwrite existing form values?"
        description="The import will replace the form fields listed below."
        confirmLabel="Overwrite and fill form" onConfirm={() => apply(true)} isDestructive>
        <ul className="list-inside list-disc text-sm text-brand-text">
          {overwrite.map(({ name }) => <li key={name}>{fieldLabels[name]}</li>)}
          {preview?.plan.curriculumChange === "overwrite" && <li>Imported curriculum</li>}
        </ul>
      </AdminConfirmDialog>
    </>
  );
}

function ImportPreview({ preview }: { preview: Preview }) {
  const { course, plan } = preview;
  const fill = plan.fields.filter(({ kind }) => kind === "fill");
  const preserve = plan.fields.filter(({ kind }) => kind === "preserve");
  const overwrite = plan.fields.filter(({ kind }) => kind === "overwrite");
  return (
    <section aria-label="Import preview" aria-live="polite" className="space-y-2 rounded-lg border border-brand-border bg-brand-page-secondary p-3 text-sm">
      <h3 className="font-semibold text-brand-text">Import preview</h3>
      <p>{Object.keys(course).length} valid JSON fields</p>
      <p>{fill.length} to fill ? {preserve.length} to preserve ? {overwrite.length} to overwrite</p>
      {fill.length > 0 && <p className="text-xs text-brand-text-muted">Fill {fill.map(({ name }) => fieldLabels[name]).join(", ")}</p>}
      {preserve.length > 0 && <p className="text-xs text-brand-text-muted">Preserve {preserve.map(({ name }) => fieldLabels[name]).join(", ")}</p>}
      {overwrite.length > 0 && <p className="text-xs text-brand-text-muted">Overwrite {overwrite.map(({ name }) => fieldLabels[name]).join(", ")}</p>}
      {plan.category && <p className="text-xs">Matched category: {plan.category.name}</p>}
      {plan.instructor && <p className="text-xs">Matched instructor: {plan.instructor.name}</p>}
      {plan.curriculum && <p className="text-xs">{plan.curriculumChange === "overwrite" ? "Replace" : "Import"} curriculum with {plan.curriculum.length} modules and {plan.curriculum.reduce((total, module) => total + module.lessons.length, 0)} lessons.</p>}
      {plan.curriculumChange === "preserve" && <p className="text-xs text-brand-text-muted">Keep the curriculum already in the form.</p>}
      {plan.warnings.map((message) => <p key={message} className="text-xs text-brand-text-muted">{message}</p>)}
      {!fill.length && !overwrite.length && !plan.curriculum && <p className="text-xs text-brand-text-muted">There are no changes to apply. Edit the JSON or choose overwrite mode.</p>}
    </section>
  );
}
