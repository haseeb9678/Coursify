
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
    <div className="group flex h-16 items-center justify-center rounded-xl border border-brand-border/70 bg-white px-6 transition-all duration-300 hover:border-brand-soft-border hover:shadow-md">
      {!failed ? (
        <img
          src={company.logo}
          alt={company.alt}
          loading="lazy"
          className="max-h-7 max-w-[110px] object-contain grayscale opacity-70 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xl font-extrabold tracking-tight text-[#6B7280] transition-colors group-hover:text-brand-text">
          {company.name}
        </span>
      )}
    </div>
  );
}

export default function HiringPartnersSection() {
  return (
    <section className="relative border-y border-brand-border/60 bg-[#FAFBFD] py-16">
      <div className="w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">

          {/* Left Column: Heading & Subtext */}
          <div className="space-y-3 text-center lg:col-span-5 lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Career Outcomes
            </span>

            <h2 className="text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
              Companies Who Hire Our Certified Students
            </h2>

            <p className="text-sm leading-relaxed text-brand-text-muted">
              Our graduates work across leading Fortune 500 enterprises
              and fast-growing technology startups worldwide.
            </p>
          </div>

          {/* Right Column: 3x2 Company Logos */}
          <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:col-span-7">
            {companies.map((company) => (
              <CompanyLogo key={company.name} company={company} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
