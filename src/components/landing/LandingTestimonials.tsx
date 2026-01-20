"use client";

import { Star } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingTestimonials() {
  const { config } = useLandingConfig();
  const { testimonials } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      <h2 className="animate-on-scroll text-sm text-slate-500 mb-10 uppercase tracking-widest pl-2">
        {testimonials.sectionLabel}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.items.map((testimonial, i) => (
          <div
            key={testimonial.name}
            className={`animate-on-scroll ${
              i > 0 ? `delay-${i}00` : ""
            } glass-panel p-8 rounded-2xl hover:bg-white/[0.02] transition-colors ${
              i === 1 ? "translate-y-0 md:translate-y-8" : ""
            }`}
          >
            <div className="flex gap-1 mb-4" style={{ color: theme.primary }}>
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              &ldquo;{testimonial.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonial.gradient}`}
              />
              <div>
                <div className="text-white text-xs font-medium">
                  {testimonial.name}
                </div>
                <div className="text-slate-500 text-[10px]">
                  {testimonial.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
