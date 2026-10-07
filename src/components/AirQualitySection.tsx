/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AirQualityData } from '../types/weather';

interface AirQualitySectionProps {
  data: AirQualityData;
  variant?: 'standard' | 'compact' | 'minimal';
}

export const AirQualitySection: React.FC<AirQualitySectionProps> = ({
  data,
  variant = 'standard',
}) => {
  const { aqi, category } = data;

  // Minimal semantic indicator color (subtle accent border/dot, no candy pills)
  const getSemanticColor = (val: number) => {
    if (val <= 50) return 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    if (val <= 100) return 'text-amber-700 dark:text-amber-400 border-amber-500/30';
    if (val <= 150) return 'text-orange-700 dark:text-orange-400 border-orange-500/30';
    if (val <= 200) return 'text-rose-700 dark:text-rose-400 border-rose-500/30';
    if (val <= 300) return 'text-purple-700 dark:text-purple-400 border-purple-500/30';
    return 'text-rose-900 dark:text-rose-300 border-rose-700/30';
  };

  const getSemanticBgLight = (val: number) => {
    if (val <= 50) return 'bg-emerald-500/10 dark:bg-emerald-500/15';
    if (val <= 100) return 'bg-amber-500/10 dark:bg-amber-500/15';
    if (val <= 150) return 'bg-orange-500/10 dark:bg-orange-500/15';
    if (val <= 200) return 'bg-rose-500/10 dark:bg-rose-500/15';
    if (val <= 300) return 'bg-purple-500/10 dark:bg-purple-500/15';
    return 'bg-rose-950/20 dark:bg-rose-900/30';
  };

  const colorClass = getSemanticColor(aqi);
  const bgClass = getSemanticBgLight(aqi);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
          AQI
        </span>
        <span className="font-mono-numbers text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {aqi}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className={`text-xs font-medium ${colorClass.split(' ')[0]}`}>
          {category}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 transition-colors ${bgClass}`}>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium tracking-wider text-neutral-600 dark:text-neutral-400 uppercase">
          Air Quality
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono-numbers">
          US EPA Standard
        </span>
      </div>

      <div className="flex items-baseline gap-3 mt-2">
        {/* Strictly AQI Value and Simple Descriptive Text Label as requested */}
        <div className="font-mono-numbers text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          {aqi}
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            Index Value
          </span>
          <span className={`text-base sm:text-lg font-medium leading-tight ${colorClass.split(' ')[0]}`}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};
