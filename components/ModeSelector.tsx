'use client';

import { RaceMode } from '@/lib/types';

interface ModeSelectorProps {
  currentMode: RaceMode;
  onModeChange: (mode: RaceMode) => void;
  liveAvailable: boolean;
}

export default function ModeSelector({
  currentMode,
  onModeChange,
  liveAvailable,
}: ModeSelectorProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h2 className="text-lg font-bold mb-2 text-white">Race Mode</h2>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onModeChange('PRE_RACE')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentMode === 'PRE_RACE'
              ? 'bg-blue-600 text-white border-2 border-blue-400'
              : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
          }`}
        >
          <div className="text-center">
            <div className="font-bold">Pre-Race</div>
            <div className="text-xs opacity-75">Predict Strategy</div>
          </div>
        </button>

        <button
          onClick={() => onModeChange('LIVE')}
          disabled={!liveAvailable}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentMode === 'LIVE'
              ? 'bg-green-600 text-white border-2 border-green-400'
              : liveAvailable
              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
          }`}
        >
          <div className="text-center">
            <div className="font-bold flex items-center justify-center gap-1">
              {currentMode === 'LIVE' && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              )}
              Live
            </div>
            <div className="text-xs opacity-75">
              {liveAvailable ? 'Track Race' : 'Not Available'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onModeChange('POST_RACE')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentMode === 'POST_RACE'
              ? 'bg-purple-600 text-white border-2 border-purple-400'
              : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
          }`}
        >
          <div className="text-center">
            <div className="font-bold">Post-Race</div>
            <div className="text-xs opacity-75">Analyze Results</div>
          </div>
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          {currentMode === 'PRE_RACE' && (
            <p>
              Run simulations and save predictions before the race. Compare different strategies
              to find the optimal approach.
            </p>
          )}
          {currentMode === 'LIVE' && (
            <p>
              Track live race data and compare against your predictions in real-time. See how
              actual strategies differ from the simulator.
            </p>
          )}
          {currentMode === 'POST_RACE' && (
            <p>
              Analyze race results and compare actual performance vs predictions. See accuracy
              metrics and strategy deviations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
