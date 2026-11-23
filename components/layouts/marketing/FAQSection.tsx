
"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQ } from "@/features/courses/types/faq.types";



interface FAQSectionProps {
  faqs: FAQ[];
  defaultOpenId?: string | null;
}

export default function FAQSection({
  faqs,
  defaultOpenId = "mentorship",
}: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const toggleFAQ = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  if (!faqs.length) return null;

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6">

        {/* Section Heading */}
        <div className="mb-12 space-y-2 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Got Questions?
          </span>

          <h2 className="text-3xl font-extrabold text-brand-text">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="divide-y divide-brand-border border-y border-brand-border">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            const answerId = `faq-answer-${faq.id}`;
            const questionId = `faq-question-${faq.id}`;

            return (
              <div key={faq.id} className="py-5">

                {/* Question */}
                <h3>
                  <button
                    id={questionId}
                    type="button"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="group flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span
                      className={`text-[16px] font-bold transition-colors ${
                        isOpen
                          ? "text-brand-primary"
                          : "text-brand-text group-hover:text-brand-primary"
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Plus / Minus Icon */}
                    <span
                      className={`shrink-0 transition-colors duration-200 ${
                        isOpen
                          ? "text-brand-primary"
                          : "text-brand-text-muted"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={20} strokeWidth={1.8} />
                      ) : (
                        <Plus size={20} strokeWidth={1.8} />
                      )}
                    </span>
                  </button>
                </h3>

                {/* Answer */}
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 text-sm leading-relaxed text-brand-text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
