"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { PlayCircle, X } from "lucide-react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";

interface CoursePreviewDialogProps {
  course: CourseDetails;
  open: boolean;
  onClose: () => void;
}

export default function CoursePreviewDialog({
  course,
  open,
  onClose,
}: CoursePreviewDialogProps) {
  return (
    <AnimatePresence>
      {open && course.previewVideoUrl && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-video">
              {course.previewImage && (
                <Image
                  src={course.previewImage}
                  alt={course.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center text-white">
                  <PlayCircle size={48} className="mx-auto mb-3" />

                  <h3 id="preview-title" className="text-lg font-bold">
                    Course preview
                  </h3>

                  <a
                    href={course.previewVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-white/80 underline hover:text-white"
                  >
                    Watch preview video
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}