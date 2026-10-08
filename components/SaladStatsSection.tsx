'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Salad, Users, Truck, Sparkles, TrendingUp, Award, Flame } from 'lucide-react';

interface SaladStatsSectionProps {
  title?: string;
  subtitle?: string;
  stat1Num?: string;
  stat1Label?: string;
  stat1Desc?: string;
  stat2Num?: string;
  stat2Label?: string;
  stat2Desc?: string;
  stat3Num?: string;
  stat3Label?: string;
  stat3Desc?: string;
}

// Helper to parse numbers with prefixes/suffixes (e.g. "24 +", "2.7k +", "72.6 K +", "₹200", "99%")
function parseStatValue(raw: string) {
  if (!raw) return { prefix: '', target: 0, suffix: '', decimals: 0 };
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { prefix: '', target: 0, suffix: trimmed, decimals: 0 };
  }
  const prefix = match[1] || '';
  const numStr = match[2] || '0';
  const suffix = match[3] || '';
  const decimals = numStr.includes('.') ? (numStr.split('.')[1] || '').length : 0;
  return {
    prefix,
    target: parseFloat(numStr) || 0,
    suffix,
    decimals,
  };
}

// Eased Count-Up Animated Counter component
const AnimatedCounter: React.FC<{ rawValue: string; isVisible: boolean; duration?: number }> = ({
  rawValue,
  isVisible,
  duration = 2000,
}) => {
  const { prefix, target, suffix, decimals } = useMemo(() => parseStatValue(rawValue), [rawValue]);
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrent(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    // Smooth Expo Out Easing for natural fast-to-gentle slowdown
    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      setCurrent(target * eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, target, duration]);

  const formattedValue = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <span className="inline-flex items-center tabular-nums">
      {prefix && <span>{prefix}</span>}
      <span>{formattedValue}</span>
      {suffix && <span className="ml-1 text-[#fbce45]">{suffix}</span>}
    </span>
  );
};

export const SaladStatsSection: React.FC<SaladStatsSectionProps> = ({
  title = 'what are you waiting for, Get your spot now!',
  subtitle = 'Join thousands of health enthusiasts in Surat enjoying daily fresh clean nutrition',
  stat1Num = '24 +',
  stat1Label = 'different varieties of salad!',
  stat1Desc = 'Rotating fresh weekly menu',
  stat2Num = '2.7k +',
  stat2Label = 'happy subscribers!',
  stat2Desc = 'Active fitness & office members',
  stat3Num = '72.6 K +',
  stat3Label = 'salad delivered!',
  stat3Desc = 'Across Surat doorsteps on time',
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      id: 1,
      number: stat1Num,
      label: stat1Label,
      icon: Salad,
      desc: stat1Desc,
      badge: 'Variety',
      delay: 'delay-100',
    },
    {
      id: 2,
      number: stat2Num,
      label: stat2Label,
      icon: Users,
      desc: stat2Desc,
      badge: 'Community',
      delay: 'delay-200',
    },
    {
      id: 3,
      number: stat3Num,
      label: stat3Label,
      icon: Truck,
      desc: stat3Desc,
      badge: 'Delivered',
      delay: 'delay-300',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-14 sm:py-20 bg-gradient-to-b from-[#6ac6ac] via-[#eaf7f2] to-white overflow-hidden font-dmsans"
    >
      {/* Background organic glow elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#20493c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fbce45]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title dynamically loaded from Admin */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-xs border border-[#20493c]/15 text-[#20493c] text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#20493c]" />
            <span>Real-Time Milestone Counter</span>
          </div>

          <h2 className="font-montserrat font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#20493c] tracking-tight">
            {title.includes(',') ? (
              <>
                <span className="text-[#20493c]">{title.split(',')[0]}</span>,{' '}
                <span className="relative inline-block text-[#20493c]">
                  <span className="relative z-10">{title.split(',').slice(1).join(',').trim()}</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 sm:h-4 bg-[#fbce45] -rotate-1 rounded-sm -z-0 opacity-80" />
                </span>
              </>
            ) : (
              <span>{title}</span>
            )}
          </h2>

          {subtitle && (
            <p className="text-xs sm:text-base text-[#20493c]/85 mt-3 font-semibold max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* 3 Animated Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`bg-white rounded-3xl p-7 sm:p-9 text-center shadow-lg border border-[#e4eae7] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col items-center justify-between relative overflow-hidden group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                } transition-all duration-700 ${stat.delay}`}
              >
                {/* Decorative accent background pill */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#6ac6ac]/15 rounded-bl-full transition-transform duration-500 group-hover:scale-150 group-hover:bg-[#fbce45]/20" />

                {/* Top Badge */}
                <div className="w-full flex justify-between items-center mb-4">
                  <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#e8f7f2] text-[#20493c] border border-[#6ac6ac]/30">
                    {stat.badge}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Animated Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-[#e8f7f2] flex items-center justify-center mb-4 text-[#20493c] group-hover:bg-[#20493c] group-hover:text-white transition-all duration-300 group-hover:rotate-6 shadow-sm">
                  <Icon className="w-8 h-8" />
                </div>

                {/* Animated Number Counter */}
                <div className="font-montserrat font-black text-4xl sm:text-5xl lg:text-6xl text-[#20493c] mb-2 tracking-tight">
                  <AnimatedCounter rawValue={stat.number} isVisible={isVisible} duration={2000 + idx * 250} />
                </div>

                {/* Stat Label */}
                <p className="font-dmsans text-base sm:text-lg font-bold text-[#20493c] capitalize mb-1">
                  {stat.label}
                </p>

                {/* Subtitle / Description */}
                <p className="text-xs sm:text-sm text-[#20493c]/70 font-medium mt-1">
                  {stat.desc}
                </p>

                {/* Bottom interactive indicator bar */}
                <div className="w-12 h-1 bg-[#6ac6ac]/40 rounded-full mt-5 group-hover:w-20 group-hover:bg-[#fbce45] transition-all duration-300" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
