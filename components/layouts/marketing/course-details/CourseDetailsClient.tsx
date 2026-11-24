"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import CourseHero from "./CourseHero";
import CourseTabs from "./CourseTabs";
import CourseEnrollmentCard from "./CourseEnrollmentCard";
import CoursePreviewDialog from "./CoursePreviewDialog";

import type { CourseDetails } from "@/features/courses/data/course-details.data";

interface CourseDetailsClientProps {
  course: CourseDetails;
}

export type CourseTab = "overview" | "curriculum" | "instructor" | "reviews";

const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.12,
    },
  },
};

const contentItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function CourseDetailsClient({
  course,
}: CourseDetailsClientProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeTab, setActiveTab] = useState<CourseTab>("overview");
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleModule = (index: number) => {
    setExpandedModules((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.55,
          ease: "easeOut",
        }}
      >
        <CourseHero
          course={course}
          onInstructorClick={() => setActiveTab("instructor")}
        />
      </motion.div>

      <section className="mx-auto max-w-350 px-4 py-8 sm:px-6 sm:py-12 xl:px-8">
        <motion.div
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10"
          variants={shouldReduceMotion ? undefined : contentVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          <motion.div
            className="min-w-0 space-y-7 lg:col-span-8"
            variants={contentItemVariants}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
          >
            <CourseTabs
              course={course}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              expandedModules={expandedModules}
              onToggleModule={toggleModule}
            />
          </motion.div>

          <motion.aside
            className="relative z-20 lg:col-span-4 lg:-mt-36"
            variants={contentItemVariants}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
          >
            <CourseEnrollmentCard
              course={course}
              isWishlisted={isWishlisted}
              onWishlistToggle={() =>
                setIsWishlisted((previous) => !previous)
              }
              onPreview={() => setPreviewOpen(true)}
            />
          </motion.aside>
        </motion.div>
      </section>

      <CoursePreviewDialog
        course={course}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </main>
  );
}