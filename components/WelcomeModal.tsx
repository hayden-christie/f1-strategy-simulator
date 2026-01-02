'use client';

import { useState, useEffect } from 'react';

interface WelcomeModalProps {
  onDismiss: () => void;
  onStartTutorial?: () => void;
}

export default function WelcomeModal({ onDismiss, onStartTutorial }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleStartTutorial = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
      onStartTutorial?.();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/90 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-gradient-to-b from-[#1a1a1a] to-[#151515] border-2 border-[#dc0000] rounded-lg shadow-2xl max-w-2xl w-full transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="border-b-2 border-[#333333] p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#dc0000] via-[#e10600] to-[#dc0000] rounded-full shadow-lg shadow-red-900/50"></div>
            <div>
              <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
                F1 Strategy Simulator
              </h1>
              <p className="text-[#14b8a6] text-sm font-mono tracking-wide font-semibold">
                2025 SEASON // TELEMETRY & STRATEGY ANALYSIS
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Text */}
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-3">
              Welcome to the Pit Lane
            </h2>
            <p className="text-[#cccccc] leading-relaxed">
              Predict optimal pit strategies with our realistic F1 race simulator. Built with authentic
              tire degradation models, fuel effects, and driver/team performance data.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1f1f1f] border border-[#333333] rounded p-4 hover:border-[#3a3a3a] transition-all">
              <div className="text-[#14b8a6] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Realistic Simulation</h3>
              <p className="text-xs text-[#999999]">
                Authentic tire degradation, fuel effects, and lap time calculations
              </p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#333333] rounded p-4 hover:border-[#3a3a3a] transition-all">
              <div className="text-[#14b8a6] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Driver & Team Data</h3>
              <p className="text-xs text-[#999999]">
                Select your favorite driver/team with performance modifiers
              </p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#333333] rounded p-4 hover:border-[#3a3a3a] transition-all">
              <div className="text-[#14b8a6] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Strategy Comparison</h3>
              <p className="text-xs text-[#999999]">
                Compare up to 3 strategies side-by-side with visual lap-by-lap analysis
              </p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#333333] rounded p-4 hover:border-[#3a3a3a] transition-all">
              <div className="text-[#14b8a6] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Live Race Tracking</h3>
              <p className="text-xs text-[#999999]">
                Compare predictions against real-time race data (coming soon)
              </p>
            </div>
          </div>

          {/* How to Start */}
          <div className="bg-[#151515] border-2 border-[#14b8a6] rounded p-4">
            <h3 className="text-sm font-bold text-[#14b8a6] uppercase mb-2">Quick Start Guide</h3>
            <ol className="space-y-2 text-sm text-[#cccccc]">
              <li className="flex gap-2">
                <span className="text-[#14b8a6] font-bold">1.</span>
                <span>Select a race from the 2025 F1 calendar</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#14b8a6] font-bold">2.</span>
                <span>Choose a driver (optional) for team-specific performance</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#14b8a6] font-bold">3.</span>
                <span>Build your strategy or load optimal suggestions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#14b8a6] font-bold">4.</span>
                <span>Run the simulation and analyze lap-by-lap results</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-[#333333] p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartTutorial}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0f9d8e] text-black font-bold uppercase tracking-wide rounded-lg shadow-md shadow-teal-900/30 hover:shadow-lg hover:shadow-teal-900/50 hover:from-[#0d9488] hover:to-[#0c7f73] transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Tutorial
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#dc0000] to-[#c50000] text-white font-bold uppercase tracking-wide rounded-lg shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/60 hover:from-[#e10600] hover:to-[#d00000] transition-all duration-300 hover:-translate-y-0.5"
          >
            Skip to Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
