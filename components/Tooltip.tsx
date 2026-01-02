'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-[#14b8a6] bg-[#1a1a1a] border border-[#14b8a6] rounded-full hover:bg-[#14b8a6] hover:text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-[#141414]"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-label="Show help"
      >
        {children || 'i'}
      </button>

      {isVisible && (
        <div className="absolute z-50 w-64 px-3 py-2 text-xs text-white bg-[#1a1a1a] border-2 border-[#14b8a6] rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div className="font-mono leading-relaxed">{content}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px]">
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[#14b8a6]"></div>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1a1a1a]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
