"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useLandingConfig } from "./LandingProvider";

export function LandingFAQ() {
  const { config } = useLandingConfig();
  const { faq } = config.copy;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!faq) return null;

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 mb-32 md:mb-48 scroll-mt-32">
      <div className="animate-on-scroll text-center mb-12 md:mb-16">
        <span className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-6">
          {faq.sectionLabel}
        </span>
        <h2 className="landing-heading-section text-[1.9rem] leading-[1.1] md:text-[2.6rem] text-white max-w-[24ch] mx-auto">{faq.title}</h2>
      </div>

      <div className="space-y-4">
        {faq.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} landing-surface rounded-2xl border border-white/10 overflow-hidden`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 md:p-6 text-left text-white"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium font-body pr-4">{item.question}</span>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Plus className={`w-3 h-3 text-[#B98CFF] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </div>
              </button>
              <div className={`px-5 md:px-6 transition-all duration-300 ${isOpen ? "max-h-80 pb-6" : "max-h-0 pb-0 overflow-hidden"}`}>
                <p className="text-slate-400 text-sm leading-relaxed font-body">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
