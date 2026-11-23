import BusinessInstructorSection from "@/components/layouts/marketing/BusinessInstructorSection";
import CareerCoursesSection from "@/components/layouts/marketing/CareerCoursesSection";
import CategoriesSection from "@/components/layouts/marketing/CategoriesSection";
import FAQSection from "@/components/layouts/marketing/FAQSection";
import FeaturedCoursesSection from "@/components/layouts/marketing/FeaturedCoursesSection";
import GrowKnowledgeSection from "@/components/layouts/marketing/GrowKnowledgeSection";
import Hero from "@/components/layouts/marketing/Hero";
import HiringPartnersSection from "@/components/layouts/marketing/HiringPartnersSection";
import SkillDomainsSection from "@/components/layouts/marketing/SkillDomainsSection";
import StudentCommunityCTA from "@/components/layouts/marketing/StudentCommunityCTA";
import TestimonialsSection from "@/components/layouts/marketing/TestimonialsSection";
import WhyChooseUsSection from "@/components/layouts/marketing/WhyChooseUsSection";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

import {
  careerCourses,
  careerTracks,
} from "@/features/courses/data/career-courses.data";

import { categories } from "@/features/courses/data/categories.data";
import { featuredCourses } from "@/features/courses/data/data.courses";
import { faqs } from "@/features/courses/data/faqs.data";
import { skillDomains } from "@/features/courses/data/skill-domains.data";
import { testimonials } from "@/features/courses/data/testimonials.data";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <MotionReveal>
        <Hero />
      </MotionReveal>
      <MotionReveal>
        <FeaturedCoursesSection courses={featuredCourses} />
      </MotionReveal>
      <MotionReveal>
        <CategoriesSection categories={categories} />
      </MotionReveal>
      <MotionReveal>
        <CareerCoursesSection
          courses={careerCourses}
          tracks={careerTracks}
        />
      </MotionReveal>
      <MotionReveal>
        <WhyChooseUsSection />
      </MotionReveal>
      <MotionReveal>
        <SkillDomainsSection domains={skillDomains} />
      </MotionReveal>
      <MotionReveal>
        <GrowKnowledgeSection />
      </MotionReveal>
      <MotionReveal>
        <HiringPartnersSection />
      </MotionReveal>
      <MotionReveal>
        <TestimonialsSection testimonials={testimonials} />
      </MotionReveal>
      <MotionReveal>
        <FAQSection faqs={faqs} defaultOpenId="lifetime-access" />
      </MotionReveal>
    </div>
  );
}