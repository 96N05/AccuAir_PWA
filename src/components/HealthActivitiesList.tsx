/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HealthActivityGroup, HealthActivityIndex } from '../types/weather';

interface HealthActivitiesListProps {
  activities: HealthActivityIndex[];
  compact?: boolean;
}

export const HealthActivitiesList: React.FC<HealthActivitiesListProps> = ({
  activities,
  compact = false,
}) => {
  const [activeGroup, setActiveGroup] = useState<'all' | HealthActivityGroup>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = activeGroup === 'all'
    ? activities
    : activities.filter((act) => act.group === activeGroup);

  const getRatingStyle = (category: string) => {
    switch (category) {
      case 'Ideal':
      case 'Very Good':
        return 'text-emerald-700 dark:text-emerald-400 font-medium';
      case 'Good':
        return 'text-teal-700 dark:text-teal-400 font-medium';
      case 'Fair':
        return 'text-amber-700 dark:text-amber-400 font-medium';
      case 'Poor':
      case 'Very Poor':
      case 'Extreme':
        return 'text-rose-700 dark:text-rose-400 font-medium';
      default:
        return 'text-neutral-700 dark:text-neutral-300 font-medium';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header and Interactive Filter Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h3 className="text-xs font-semibold tracking-wider text-neutral-600 dark:text-neutral-400 uppercase">
            Health & Activities
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            AccuWeather Daily Lifestyle Forecast
          </p>
        </div>

        {/* Functional segmented control tabs */}
        {!compact && (
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveGroup('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeGroup === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              All ({activities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveGroup('fitness')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeGroup === 'fitness'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Fitness
            </button>
            <button
              type="button"
              onClick={() => setActiveGroup('health')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeGroup === 'health'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Health
            </button>
            <button
              type="button"
              onClick={() => setActiveGroup('outdoor')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeGroup === 'outdoor'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Outdoor
            </button>
          </div>
        )}
      </div>

      {/* Activity List items: Clean unboxed list with typographic separators */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="py-2.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 rounded-lg px-2 -mx-2"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {item.name}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
                  ·
                </span>
                <span className={`text-xs ${getRatingStyle(item.category)}`}>
                  {item.category}
                </span>
              </div>
              {!compact && item.text && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {item.text.length > 52 ? (
                    expandedIds[item.id] ? (
                      <span>
                        {item.text}
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="ml-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100 underline underline-offset-2 cursor-pointer"
                        >
                          Show less
                        </button>
                      </span>
                    ) : (
                      <span>
                        {item.text.slice(0, 48).trimEnd()}...
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="ml-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white underline underline-offset-2 cursor-pointer"
                        >
                          Read more
                        </button>
                      </span>
                    )
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 shrink-0 self-end sm:self-center font-mono-numbers">
              <span className="uppercase text-[10px] tracking-wider text-neutral-400">
                Score
              </span>
              <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
                {item.value}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
