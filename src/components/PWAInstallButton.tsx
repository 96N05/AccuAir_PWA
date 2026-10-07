/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xl text-neutral-900 dark:text-neutral-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Install on iOS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                Add AccuAir to your iPhone or iPad home screen for instant full-screen access and offline support:
              </p>

              <ol className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 mt-0.5">
                    <Share2 className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <span className="font-semibold">Step 1:</span> Tap the <span className="font-medium text-blue-600 dark:text-blue-400">Share</span> button in Safari's bottom toolbar.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-semibold">Step 2:</span> Scroll down and tap <span className="font-medium">"Add to Home Screen"</span>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-semibold">Step 3:</span> Tap <span className="font-medium">Add</span> in the top right corner.
                  </div>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-5 py-2 px-3 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
