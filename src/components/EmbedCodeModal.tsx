/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationData, WidgetVariant } from '../types/weather';
import { X, Copy, Check, Code, ExternalLink } from 'lucide-react';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  variant: WidgetVariant;
  tempUnit: 'C' | 'F';
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  isOpen,
  onClose,
  location,
  variant,
  tempUnit,
}) => {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://accuair.app';
  const iframeSrc = `${currentOrigin}?embed=true&loc=${encodeURIComponent(location.name)}&lat=${location.latitude}&lon=${location.longitude}&variant=${variant}&unit=${tempUnit}`;

  const iframeSnippet = `<iframe
  src="${iframeSrc}"
  width="100%"
  height="${variant === 'compact' ? '90' : variant === 'minimal' ? '220' : '480'}"
  style="border:none; border-radius:16px; overflow:hidden; max-width:480px;"
  title="AccuWeather Air Quality & Health Forecast - ${location.name}"
  loading="lazy"
></iframe>`;

  const scriptSnippet = `<!-- AccuAir Responsive Widget Container -->
<div 
  id="accuair-widget"
  data-location="${location.name}"
  data-lat="${location.latitude}"
  data-lon="${location.longitude}"
  data-variant="${variant}"
  data-unit="${tempUnit}"
></div>
<script src="${currentOrigin}/embed.js" async></script>`;

  const codeToCopy = embedType === 'iframe' ? iframeSnippet : scriptSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <h2 id="embed-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Embed on Your Website
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Copy and paste this minimal snippet into your website HTML, blog, sidebar, or dashboard to display real-time AccuWeather air quality and health forecasts.
          </p>

          {/* Embed format switch */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setEmbedType('iframe')}
              className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center font-medium ${
                embedType === 'iframe'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Standard iframe
            </button>
            <button
              type="button"
              onClick={() => setEmbedType('script')}
              className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center font-medium ${
                embedType === 'script'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Async Web Script
            </button>
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="p-4 bg-neutral-900 text-neutral-100 dark:bg-neutral-950 dark:text-neutral-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-neutral-800">
              {codeToCopy}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Target Location:</span>
              <span>{location.name}, {location.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Auto-Refresh:</span>
              <span>Hourly auto-refresh & offline cached state enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
