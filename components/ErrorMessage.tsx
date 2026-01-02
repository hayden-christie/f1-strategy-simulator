'use client';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-[#1f1f1f] border-2 border-[#dc0000] rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0 w-6 h-6 text-[#dc0000]">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">
            Validation Error
          </h3>
          <p className="text-sm text-[#cccccc] font-mono leading-relaxed">{message}</p>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-[#999999] hover:text-white transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
