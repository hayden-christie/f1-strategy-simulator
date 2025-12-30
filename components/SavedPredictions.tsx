'use client';

import { RacePrediction } from '@/lib/types';
import { formatRaceTime } from '@/lib/lapTimeCalculator';
import { deletePrediction } from '@/lib';
import { getDriverById } from '@/lib';

interface SavedPredictionsProps {
  predictions: RacePrediction[];
  onPredictionSelect: (prediction: RacePrediction) => void;
  onPredictionDelete: (predictionId: string) => void;
  selectedPredictionId?: string;
}

export default function SavedPredictions({
  predictions,
  onPredictionSelect,
  onPredictionDelete,
  selectedPredictionId,
}: SavedPredictionsProps) {
  if (predictions.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-3">
        <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide">Saved Predictions</h2>
        <div className="p-4 border-2 border-dashed border-[#2a2a2a] rounded text-center">
          <p className="text-sm text-[#666666] font-mono uppercase">No saved predictions yet</p>
          <p className="text-xs mt-1 text-[#444444]">Run simulations and click "Save Prediction" to track your predictions</p>
        </div>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, predictionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this prediction?')) {
      deletePrediction(predictionId);
      onPredictionDelete(predictionId);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-3">
      <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide">
        Saved Predictions ({predictions.length})
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {predictions.map((prediction) => {
          const driver = prediction.driverId ? getDriverById(prediction.driverId) : null;
          const isSelected = prediction.id === selectedPredictionId;

          return (
            <div
              key={prediction.id}
              onClick={() => onPredictionSelect(prediction)}
              className={`p-3 rounded border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#dc0000] bg-[#dc0000]/10 shadow-lg shadow-red-900/30'
                  : 'border-[#2a2a2a] bg-[#0a0a0a] hover:border-[#444444] hover:bg-[#151515]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      {prediction.raceName}
                    </h3>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-[#dc0000] text-white text-xs font-bold uppercase rounded">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white space-y-1 font-mono">
                    <div>
                      <span className="text-[#999999]">STRATEGY:</span>{' '}
                      {prediction.strategy.name}
                    </div>
                    {driver && (
                      <div>
                        <span className="text-[#999999]">DRIVER:</span>{' '}
                        {driver.fullName}
                      </div>
                    )}
                    <div>
                      <span className="text-[#999999]">PREDICTED TIME:</span>{' '}
                      <span className="text-[#14b8a6] font-bold">{formatRaceTime(prediction.simulationResult.totalRaceTime)}</span>
                    </div>
                    <div>
                      <span className="text-[#999999]">PIT STOPS:</span>{' '}
                      {prediction.strategy.pitStops.length} (
                      {prediction.strategy.pitStops.map(ps => `L${ps.lap}`).join(', ')})
                    </div>
                    <div>
                      <span className="text-[#999999]">SAVED:</span>{' '}
                      {new Date(prediction.savedAt).toLocaleDateString()} at{' '}
                      {new Date(prediction.savedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, prediction.id)}
                  className="ml-2 p-1.5 text-[#dc0000] hover:text-[#ff0000] hover:bg-[#dc0000]/20 rounded transition-colors"
                  title="Delete prediction"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
