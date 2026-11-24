"use client";

import { AnimatePresence, motion } from "motion/react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { CourseTab } from "./CourseDetailsClient";
import CurriculumTab from "./tabs/CurriculumTab";
import OverviewTab from "./tabs/OverviewTab";
import InstructorTab from "./tabs/InstructorTab";
import ReviewsTab from "./tabs/ReviewsTab";


interface CourseTabsProps {
  course: CourseDetails;
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
  expandedModules: number[];
  onToggleModule: (index: number) => void;
}

const tabs: { label: string; value: CourseTab }[] = [
  { label: "Overview", value: "overview" },
  { label: "Curriculum", value: "curriculum" },
  { label: "Instructor", value: "instructor" },
  { label: "Reviews", value: "reviews" },
];

export default function CourseTabs({
  course,
  activeTab,
  onTabChange,
  expandedModules,
  onToggleModule,
}: CourseTabsProps) {
  return (
    <>
      <div className="sticky top-[68px] z-30 -mx-4 border-b border-brand-border bg-background/95 px-4 backdrop-blur-xl sm:top-[76px] sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Course details"
          className="flex items-center gap-6 overflow-x-auto scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`relative shrink-0 py-4 text-xs font-bold transition-colors sm:text-sm ${
                activeTab === tab.value
                  ? "text-primary"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              {tab.label}

              {activeTab === tab.value && (
                <motion.span
                  layoutId="course-tab-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 35,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab course={course} />}

          {activeTab === "curriculum" && (
            <CurriculumTab
              course={course}
              expandedModules={expandedModules}
              onToggleModule={onToggleModule}
            />
          )}

          {activeTab === "instructor" && <InstructorTab course={course} />}

          {activeTab === "reviews" && <ReviewsTab course={course} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}