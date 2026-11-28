import assert from "node:assert/strict";
import { test } from "node:test";
import { detectContentType } from "../features/courses/materials/content-type.ts";
import { loadAuthorizedPreviewFile, materialFilename, readPdf, readPlainText } from "../features/courses/materials/preview-files.ts";

test("uses specific types, MIME values and file paths to identify curriculum materials", () => {
  for (const [metadata, kind] of [
    [{ type: "TEXT" }, "text"],
    [{ type: "VIDEO" }, "video"],
    [{ type: "LINK", url: "https://test.example/guide.pdf" }, "link"],
    [{ type: "FILE", mimeType: "application/pdf", fileName: "guide.txt" }, "pdf"],
    [{ type: "FILE", mimeType: "image/png" }, "image"],
    [{ type: "FILE", fileName: "music.MP3" }, "audio"],
    [{ type: "FILE", fileName: "reference.ZIP" }, "archive"],
    [{ type: "DOCUMENT", fileName: "outline.docx" }, "document"],
    [{ type: "DOCUMENT", fileName: "figures.xlsx" }, "spreadsheet"],
    [{ type: "DOCUMENT", fileName: "talk.pptx" }, "presentation"],
    [{ type: "FILE", url: "https://test.example/demo.ts?signed=value" }, "code"],
    [{ type: "FILE", url: "https://test.pdf" }, "file"],
  ]) assert.equal(detectContentType(metadata), kind);
});

test("sanitizes titles without duplicating extensions or discarding international characters", () => {
  assert.equal(materialFilename(" Chapter: 1/Part 2 ", "txt"), "Chapter- 1-Part 2.txt");
  assert.equal(materialFilename("Résumé.PDF", "pdf"), "Résumé.pdf");
  assert.equal(materialFilename("COM1", "txt"), "_COM1.txt");
  assert.equal(materialFilename("...", "txt"), "lesson.txt");
});

test("preserves literal text and identifies a PDF before passing it to the viewer", async () => {
  const text = "Line one\r\n<script>untrusted</script>\n";
  assert.equal(await readPlainText(new Blob([text], { type: "text/plain" })), text);
  await assert.rejects(readPlainText(new Blob([text], { type: "text/html" })), /plain text/);
  assert.equal((await readPdf(new Blob(["%PDF-1.7\n"]))).type, "application/pdf");
  await assert.rejects(readPdf(new Blob(["<html>Error</html>"])), /readable PDF/);
});

test("renews a rejected signed read once and stops signing when the preview is closed", async (t) => {
  let signatures = 0;
  const read = async () => ({ url: `https://media.example/${++signatures}`, expiresAt: null });
  const fetch = t.mock.method(globalThis, "fetch", async (url) => String(url).endsWith("/1")
    ? new Response(null, { status: 403 })
    : new Response("Plain text"));
  const controller = new AbortController();
  const result = await loadAuthorizedPreviewFile(read, controller.signal);
  assert.equal(await result.text(), "Plain text");
  assert.equal(signatures, 2);
  assert.equal(fetch.mock.callCount(), 2);

  controller.abort();
  await assert.rejects(loadAuthorizedPreviewFile(read, controller.signal), { name: "AbortError" });
  assert.equal(signatures, 2);
  assert.equal(fetch.mock.callCount(), 2);
});
