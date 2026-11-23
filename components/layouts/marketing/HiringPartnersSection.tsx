"use client";

import { useState } from "react";

const companies = [
  {
    name: "Amazon",
    logo: "https://cdn.simpleicons.org/amazon/6B7280",
    alt: "Amazon logo",
  },
  {
    name: "Google",
    logo: "https://cdn.simpleicons.org/google/6B7280",
    alt: "Google logo",
  },
  {
    name: "Apple",
    logo: "https://cdn.simpleicons.org/apple/6B7280",
    alt: "Apple logo",
  },
  {
    name: "Coursera",
    logo: "https://cdn.simpleicons.org/coursera/6B7280",
    alt: "Coursera logo",
  },
  {
    name: "IBM",
    logo: "https://cdn.simpleicons.org/ibm/6B7280",
    alt: "IBM logo",
  },
  {
    name: "Intel",
    logo: "https://cdn.simpleicons.org/intel/6B7280",
    alt: "Intel logo",
  },
];

function CompanyLogo({
  company,
}: {
  company: (typeof companies)[number];
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="group flex h-16 w-40 shrink-0 items-center cursor-default!
     justify-center rounded-xl border border-brand-border/70 bg-white px-6 transition-all duration-300
      hover:border-primary/50 hover:shadow-md sm:w-44">
      {!failed ? (
        <img
          src={company.logo}
          alt={company.alt}
          loading="lazy"
          className="max-h-7 max-w-[110px] object-contain grayscale opacity-70
           transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
          onError={() => setFailed(true)}
        />
      ) : (
          <span className="text-xl font-extrabold tracking-tight text-[#6B7280]
          transition-colors duration-300 group-hover:text-brand-primary">
  {company.name}
</span>
      )}
    </div>
  );
}

export default function HiringPartnersSection() {
  return (
    <section className="relative border-y border-brand-border/60 bg-[#FAFBFD] py-16">
      {/* Marquee motion: the track holds two identical sets and slides by exactly one set */}
      <style>{`
        @keyframes hiring-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .hiring-marquee-track {
          animation: hiring-marquee 30s linear infinite;
          will-change: transform;
        }
        .hiring-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiring-marquee-track { animation: none; }
          .hiring-marquee { overflow-x: auto; }
        }
      `}</style>

      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">

          {/* Left Column: Heading & Subtext */}
          <div className="space-y-3 text-center lg:col-span-5 lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Career Outcomes
            </span>

            <h2 className="text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
              Companies Who Hire Our{" "}
                <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
      Certified  Students
    </span>
              
            </h2>

            <p className="text-sm leading-relaxed text-brand-text-muted">
              Our graduates work across leading Fortune 500 enterprises
              and fast-growing technology startups worldwide.
            </p>
          </div>

          {/* Right Column: Continuously moving company logos (pauses on hover) */}
          <div
            className="hiring-marquee min-w-0 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] lg:col-span-7"
          >
            <div className="hiring-marquee-track flex w-max">
              {[0, 1].map((setIndex) => (
                <div
                  key={setIndex}
                  aria-hidden={setIndex === 1 ? true : undefined}
                  className="flex shrink-0 items-center gap-6 pr-6"
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