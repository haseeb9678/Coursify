
import CareerCoursesSection from "@/components/layouts/marketing/CareerCoursesSection";
import FAQSection from "@/components/layouts/marketing/FAQSection";
import HomeLearningSections from "@/components/layouts/marketing/HomeLearningSections";
import GrowKnowledgeSection from "@/components/layouts/marketing/GrowKnowledgeSection";
import PublicHeroSection from "@/features/website/PublicHeroSection";
import HiringPartnersSection from "@/components/layouts/marketing/HiringPartnersSection";
import SkillDomainsSection from "@/components/layouts/marketing/SkillDomainsSection";
import TestimonialsSection from "@/components/layouts/marketing/TestimonialsSection";
import WhyChooseUsSection from "@/components/layouts/marketing/WhyChooseUsSection";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

import { skillDomains } from "@/features/courses/data/skill-domains.data";
import { testimonials } from "@/features/home/data/testimonials.data";
import { faqs } from "@/features/home/data/faqs.data";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col hide-scrollbar">
      <MotionReveal>
        <PublicHeroSection />
      </MotionReveal>
      <MotionReveal>
        <HomeLearningSections />
      </MotionReveal>
      <MotionReveal>
        <CareerCoursesSection />
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