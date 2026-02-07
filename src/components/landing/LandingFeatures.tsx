"use client";

import { Check } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingFeatures() {
  const { config } = useLandingConfig();
  const { features } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;

          if (feature.size === "large") {
            return (
              <div
                key={feature.title}
                className="animate-on-scroll md:col-span-2 glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover group"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom right, ${theme.primary}1a, transparent)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                    <Icon className="w-6 h-6" style={{ color: theme.accent }} />
                  </div>
                  <h3 className="text-2xl text-white mb-4 font-display font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 max-w-md text-sm leading-relaxed font-body">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 group-hover:opacity-50 transition-opacity">
                  <div
                    className="w-full h-full blur-3xl"
                    style={{
                      background: `radial-gradient(ellipse at bottom right, ${theme.primary}, transparent)`,
                    }}
                  />
                </div>
              </div>
            );
          }

          if (feature.size === "medium") {
            return (
              <div
                key={feature.title}
                className={`animate-on-scroll delay-${(i % 3) * 100} glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover flex flex-col justify-between`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-medium text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-body">{feature.description}</p>
                </div>
                {feature.badge && (
                  <div className="mt-8 flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] uppercase text-slate-500 font-mono tracking-widest">
                      {feature.badge}
                    </span>
                  </div>
                )}
              </div>
            );
          }

          // Full width feature
          return (
            <div
              key={feature.title}
              className={`animate-on-scroll delay-${(i % 3) * 100} md:col-span-3 glass-panel rounded-3xl p-10 relative overflow-hidden border-glow-hover flex flex-col md:flex-row items-center gap-12`}
            >
              <div className="flex-1 relative z-10">
                <h3 className="text-2xl text-white mb-4 font-display font-semibold">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-body">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1 w-full relative h-24">
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  {["m0", "m4", "m8", "m12"].map((m, idx) => (
                    <div
                      key={m}
                      className={`w-14 h-14 rounded-lg ${
                        idx === 3
                          ? "z-10"
                          : "bg-[#111] border border-white/10 opacity-50 scale-90 blur-[1px]"
                      } flex items-center justify-center`}
                      style={
                        idx === 3
                          ? {
                              backgroundColor: "#151518",
                              border: `1px solid ${theme.primary}66`,
                              boxShadow: `0 0 30px -10px ${theme.primary}4d`,
                            }
                          : undefined
                      }
                    >
                      {idx === 3 ? (
                        <Check
                          className="w-5 h-5"
                          style={{ color: theme.primary }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
