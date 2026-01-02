'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  target: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Select a Race',
    description: 'Choose any race from the 2025 F1 calendar. Each circuit has unique characteristics that affect strategy.',
    target: '.race-selector',
    position: 'bottom',
  },
  {
    title: 'Choose a Driver',
    description: 'Select a driver to see team-specific performance modifiers. Each driver has unique tire management skills.',
    target: '.driver-selector',
    position: 'bottom',
  },
  {
    title: 'Build Your Strategy',
    description: 'Create your pit stop strategy by adding pit stops and selecting tire compounds. You can compare up to 3 strategies.',
    target: '.strategy-builder',
    position: 'top',
  },
  {
    title: 'Run the Simulation',
    description: 'Click here to simulate the race with your strategies. The simulator uses realistic tire degradation and fuel effects.',
    target: '.run-simulation',
    position: 'top',
  },
  {
    title: 'Analyze Results',
    description: 'View lap-by-lap analysis, compare strategies, and see which one gives you the fastest race time!',
    target: '.results-section',
    position: 'top',
  },
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkipTutorial = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-80' : 'opacity-0'
        }`}
        onClick={handleSkipTutorial}
      />

      {/* Tutorial Tooltip */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] border-2 border-[#14b8a6] rounded-lg shadow-2xl max-w-md w-full">
          {/* Header with Progress */}
          <div className="border-b-2 border-[#333333] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Tutorial ({currentStep + 1}/{tutorialSteps.length})
              </h3>
              <button
                onClick={handleSkipTutorial}
                className="text-xs text-[#999999] hover:text-white uppercase tracking-wide transition-colors"
              >
                Skip
              </button>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1 bg-[#333333] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-lg font-bold text-[#14b8a6] uppercase tracking-wide mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-[#cccccc] leading-relaxed">{step.description}</p>
            </div>

            {/* Tip Icon */}
            <div className="flex items-start gap-3 bg-[#1f1f1f] border border-[#333333] rounded p-3">
              <div className="flex-shrink-0 text-[#14b8a6]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs text-[#999999] font-mono">
                {currentStep === 0 && 'Each circuit has different lap counts and characteristics.'}
                {currentStep === 1 && 'Drivers like Max Verstappen have better tire management skills.'}
                {currentStep === 2 && 'Try loading optimal strategies to see what works best!'}
                {currentStep === 3 && 'The simulation takes into account tire deg, fuel, and pit stops.'}
                {currentStep === 4 && 'Look for the U-shaped tire degradation curve in the charts!'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t-2 border-[#333333] p-4 flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-[#1f1f1f] border border-[#333333] text-[#999999] font-bold uppercase text-xs rounded hover:bg-[#252525] hover:border-[#3a3a3a] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1f1f1f]"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#14b8a6] to-[#0f9d8e] text-black font-bold uppercase text-xs rounded shadow-md shadow-teal-900/30 hover:shadow-lg hover:shadow-teal-900/50 hover:from-[#0d9488] hover:to-[#0c7f73] transition-all duration-300"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
