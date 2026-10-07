/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HealthActivityIndex } from '../types/weather';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MinimalActivitiesGalleryProps {
  activities: HealthActivityIndex[];
  itemsPerPage?: number;
}

export const MinimalActivitiesGallery: React.FC<MinimalActivitiesGalleryProps> = ({
  activities,
  itemsPerPage = 3,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const pageIndex = Math.min(currentPage, totalPages - 1);

  const startIndex = pageIndex * itemsPerPage;
  const currentItems = activities.slice(startIndex, startIndex + itemsPerPage);

  // Group label heuristic for current page
  const getPageTitle = (page: number) => {
    if (page === 0) return 'Fitness';
    if (page === 1) return 'Health & Allergy';
    return 'Outdoor & Lifestyle';
  };

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

  const nextPage = () => {
    setCurrentPage((p) => (p + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((p) => (p - 1 + totalPages) % totalPages);
  };

  // Swipe handling
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swiped left -> next page
      nextPage();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev page
      prevPage();
    }
  };

  return (
    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
      {/* Gallery Header with Navigation and Page Counter */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider truncate">
            {getPageTitle(pageIndex)}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
            ·
          </span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono-numbers">
            {pageIndex + 1}/{totalPages}
          </span>
        </div>

        {/* Gallery navigation controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevPage}
            aria-label="Previous activities page"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextPage}
            aria-label="Next activities page"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Swipeable Activity Items */}
      <div
        className="space-y-1.5 touch-pan-y select-none transition-opacity duration-150"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentItems.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between text-xs py-1 px-1.5 -mx-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <span className="text-neutral-600 dark:text-neutral-400 truncate pr-2">
              {act.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={getRatingStyle(act.category)}>
                {act.category}
              </span>
              <span className="text-[11px] font-mono-numbers text-neutral-400 dark:text-neutral-500">
                {act.value}/10
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Page Dot Indicators & Swipe Hint */}
      <div className="mt-2.5 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentPage(idx)}
              aria-label={`Go to page ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === pageIndex
                  ? 'w-4 bg-neutral-800 dark:bg-neutral-200'
                  : 'w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
          Swipe or click &larr;&rarr;
        </span>
      </div>
    </div>
  );
};
