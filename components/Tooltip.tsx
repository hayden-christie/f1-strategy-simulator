/**
 * Reusable Tooltip Component
 * F1-themed info tooltips with dark styling
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();

      // Check if tooltip would go off the top of the screen
      if (triggerRect.top - tooltipRect.height < 10) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || (
          <span className="ml-1 text-xs text-gray-400 hover:text-gray-300 transition-colors">
            ⓘ
          </span>
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-gray-100 text-xs rounded-lg shadow-xl border border-gray-700 w-64 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{
            maxWidth: '280px',
            minWidth: '200px',
          }}
        >
          <div className="relative leading-relaxed whitespace-normal">
            {text}
            {/* Arrow pointing down (for top position) or up (for bottom position) */}
            {position === 'top' ? (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
            ) : (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-gray-900"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoLabelProps {
  label: string;
  tooltip: string;
}

export function InfoLabel({ label, tooltip }: InfoLabelProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <span>{label}</span>
      <Tooltip text={tooltip} />
    </div>
  );
}
