"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingHowItWorks() {
  const { config } = useLandingConfig();
  const { howItWorks } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      <div className="text-center mb-16 animate-on-scroll">
        <h2 className="text-3xl text-white mb-4 tracking-tight font-semibold">
          {howItWorks.title}
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          {howItWorks.subtitle}
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 h-full w-px hidden md:block"
          style={{
            background: `linear-gradient(to bottom, transparent, ${theme.primary}, ${theme.primary}, transparent)`,
          }}
        />

        {/* Steps */}
        {howItWorks.steps.map((item, i) => {
          const Icon = item.icon;
          const isEven = i % 2 === 0;

          return (
            <div
              key={item.step}
              className={`relative flex flex-col md:flex-row items-center gap-8 ${
                i < howItWorks.steps.length - 1 ? "mb-16" : ""
              }`}
            >
              <div
                className={`flex-1 ${
                  isEven ? "md:text-right order-2 md:order-1" : ""
                } animate-on-scroll${isEven ? "-left" : "-right"} ${
                  i > 0 ? `delay-${i}00` : ""
                }`}
              >
                <div
                  className={`glass-panel rounded-2xl p-8 border-glow-hover ${
                    !isEven ? "md:order-3" : ""
                  }`}
                >
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                    style={{
                      backgroundColor: `${theme.primary}1a`,
                      border: `1px solid ${theme.primary}33`,
                    }}
                  >
                    <span
                      className="text-[10px]"
                      style={{ color: theme.accent }}
                    >
                      PASO {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl text-white mb-3 font-medium">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                className={`relative z-10 ${
                  isEven ? "order-1 md:order-2" : ""
                } animate-on-scroll-scale delay-${i}00`}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 0 30px ${theme.primary}66`,
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div
                className={`flex-1 ${isEven ? "order-3" : ""} hidden md:block`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
