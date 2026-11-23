"use client";

import type { ReactNode } from "react";

interface HiringPartner {
  name: string;
  renderLogo: () => ReactNode;
}

const companies: HiringPartner[] = [
  {
    name: "Amazon",
    renderLogo: () => (
      <div className="flex flex-col items-center leading-none text-[#111827]">
        <span className="text-[19px] font-extrabold tracking-tight">
          amazon
        </span>
        <svg
          viewBox="0 0 120 18"
          className="mt-0.5 h-3 w-20 overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 4.5C34 15.5 73 16 102 4.5"
            stroke="#FF9900"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M96 2.5L104.5 4L100 11.5"
            stroke="#FF9900"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
  },
  {
    name: "Google",
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg
          viewBox="0 0 24 24"
          className="size-6 shrink-0"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.97 11.97 0 0 0 0 12c0 1.93.46 3.75 1.29 5.38l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
          />
        </svg>
        <span className="text-[19px] font-semibold tracking-tight text-[#1F2937]">
          Google
        </span>
      </div>
    ),
  },
  {
    name: "Apple",
    renderLogo: () => (
      <div className="flex items-center gap-2 text-[#111827]">
        <svg
          viewBox="0 0 24 24"
          className="size-6 shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.68-.82 1.14-1.97 1.01-3.12-.98.04-2.17.65-2.87 1.47-.62.72-1.17 1.89-1.02 3.02 1.1.08 2.2-.55 2.88-1.37" />
        </svg>
        <span className="text-[19px] font-semibold tracking-tight">Apple</span>
      </div>
    ),
  },
  {
    name: "Coursera",
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="size-6 shrink-0"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="#0056D2" strokeWidth="4.2" />
          <path
            d="M15.2 9.4A4.2 4.2 0 1 0 15.2 14.6"
            stroke="#0056D2"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[18px] font-bold tracking-tight text-[#0056D2]">
          coursera
        </span>
      </div>
    ),
  },
  {
    name: "IBM",
    renderLogo: () => (
      <div className="flex items-center">
        <svg
          viewBox="0 0 92 34"
          className="h-7 w-auto text-[#0F62FE]"
          fill="currentColor"
          aria-label="IBM"
        >
          {/* Horizontal stripe IBM mark */}
          <rect x="2" y="2" width="22" height="2.4" />
          <rect x="2" y="6.4" width="22" height="2.4" />
          <rect x="8" y="10.8" width="10" height="2.4" />
          <rect x="8" y="15.2" width="10" height="2.4" />
          <rect x="8" y="19.6" width="10" height="2.4" />
          <rect x="8" y="24" width="10" height="2.4" />
          <rect x="2" y="28.4" width="22" height="2.4" />

          <rect x="30" y="2" width="22" height="2.4" />
          <rect x="30" y="6.4" width="22" height="2.4" />
          <rect x="30" y="10.8" width="18" height="2.4" />
          <rect x="30" y="15.2" width="21" height="2.4" />
          <rect x="30" y="19.6" width="21" height="2.4" />
          <rect x="30" y="24" width="18" height="2.4" />
          <rect x="30" y="28.4" width="22" height="2.4" />

          <rect x="58" y="2" width="8" height="2.4" />
          <rect x="82" y="2" width="8" height="2.4" />
          <rect x="58" y="6.4" width="11" height="2.4" />
          <rect x="79" y="6.4" width="11" height="2.4" />
          <rect x="58" y="10.8" width="14" height="2.4" />
          <rect x="76" y="10.8" width="14" height="2.4" />
          <rect x="58" y="15.2" width="32" height="2.4" />
          <rect x="58" y="19.6" width="32" height="2.4" />
          <rect x="58" y="24" width="32" height="2.4" />
          <rect x="58" y="28.4" width="32" height="2.4" />
        </svg>
      </div>
    ),
  },
  {
    name: "Intel",
    renderLogo: () => (
      <div className="inline-flex flex-col items-center rounded-md border-2 border-[#0068B5] px-3 py-1 leading-none text-[#0068B5]">
        <span className="text-[17px] font-black tracking-tight lowercase">
          intel
        </span>
      </div>
    ),
  },
];

function CompanyLogo({ company }: { company: HiringPartner }) {
  return (
    <div
      className="group flex h-16 w-44 shrink-0 cursor-default items-center justify-center rounded-xl border border-brand-border/80 bg-white px-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-lg hover:shadow-blue-950/5 sm:h-[70px] sm:w-48"
      title={company.name}
    >
      <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        {company.renderLogo()}
      </div>
    </div>
  );
}

export default function HiringPartnersSection() {
  return (
    <section className="relative overflow-x-clip border-y border-brand-border/60 bg-[#FAFBFD] py-14 sm:py-16 lg:py-20">
      <style>{`
        @keyframes hiring-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .hiring-marquee-track {
          animation: hiring-marquee 28s linear infinite;
          will-change: transform;
        }

        .hiring-marquee-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .hiring-marquee-track {
            animation: none;
          }

          .hiring-marquee {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Heading */}
          <div className="space-y-3 text-center lg:col-span-5 lg:text-left">
            <span className="inline-block rounded-full border border-brand-soft-border bg-brand-soft px-3.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-brand-primary uppercase">
              Career Outcomes
            </span>

            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl xl:text-[34px]">
              Companies Who Hire Our{" "}
              <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
                Certified Students
              </span>
            </h2>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-brand-text-muted sm:text-[15px] lg:mx-0">
              Our graduates work across leading Fortune 500 enterprises and
              fast-growing technology startups worldwide.
            </p>
          </div>

          {/* Company Logos Marquee */}
          <div
            className="hiring-marquee min-w-0 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] lg:col-span-7"
          >
            <div className="hiring-marquee-track flex w-max">
              {[0, 1].map((setIndex) => (
                <div
                  key={setIndex}
                  aria-hidden={setIndex === 1 ? true : undefined}
                  className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5"
                >
                  {companies.map((company) => (
                    <CompanyLogo
                      key={`${setIndex}-${company.name}`}
                      company={company}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}