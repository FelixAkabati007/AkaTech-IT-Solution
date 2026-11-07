import React from "react";
import { PRICING_PACKAGES } from "@lib/constants";
import { Icons } from "@components/ui/Icons";

export const Pricing = ({ onSelectPlan }) => (
  <section
    id="pricing"
    className="py-16 md:py-24 bg-white/70 dark:bg-black/60 backdrop-blur-md border-t border-gray-200/50 dark:border-white/5 transition-colors duration-500"
  >
    <div className="container mx-auto px-4">
      <div className="text-center mb-12 md:mb-20">
        <span className="text-akatech-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
          Investment
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4 transition-colors duration-500">
          Transparent Packages
        </h2>
        <p className="text-gray-500 text-sm">Pricing in Ghana Cedis (GHS)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRICING_PACKAGES.map((pkg, idx) => (
          <div
            key={idx}
            className={`relative p-8 md:p-10 flex flex-col transition-all duration-500 rounded-2xl backdrop-blur-md ${
              pkg.recommended
                ? "bg-gradient-to-b from-white/95 dark:from-[#1a1a1a]/90 to-white/85 dark:to-black/90 border border-akatech-gold shadow-[0_0_30px_rgba(197,160,89,0.15)]"
                : "bg-white/85 dark:bg-akatech-card/85 border border-gray-200/70 dark:border-white/5 hover:border-akatech-gold/30 dark:hover:border-white/10 shadow-lg dark:shadow-none"
            }`}
          >
            {pkg.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-gradient text-black text-[10px] font-bold px-6 py-1 uppercase tracking-widest shadow-lg">
                Best Value
              </div>
            )}
            {pkg.audience && (
              <span className="text-[11px] font-semibold text-akatech-gold uppercase tracking-wider mb-2 block">
                {pkg.audience}
              </span>
            )}
            <h3 className="text-xl md:text-2xl font-serif mb-2 text-gray-900 dark:text-white transition-colors duration-500">
              {pkg.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm text-akatech-gold">GH₵</span>
              <span
                className={`text-3xl md:text-4xl font-bold ${
                  pkg.recommended
                    ? "text-transparent bg-clip-text bg-gold-gradient"
                    : "text-gray-900 dark:text-white"
                } transition-colors duration-500`}
              >
                {pkg.price}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-500 text-sm mb-8 min-h-[40px] transition-colors duration-500">
              {pkg.description}
            </p>

            <ul className="space-y-4 mb-10 flex-1">
              {pkg.features.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-500"
                >
                  <div className="mt-1">
                    <Icons.Check className="text-akatech-gold w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan && onSelectPlan(pkg)}
              className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                pkg.recommended
                  ? "bg-gold-gradient text-black hover:shadow-[0_0_15px_rgba(197,160,89,0.4)]"
                  : "border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-akatech-gold hover:text-akatech-gold"
              }`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
