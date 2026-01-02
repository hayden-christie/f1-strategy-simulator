'use client';

import { LiveComparison } from '@/lib/types';
import { formatRaceTime, formatLapTime, formatTimeDelta, getTimeDeltaColor } from '@/lib/lapTimeCalculator';

interface PostRaceAnalysisProps {
  comparison: LiveComparison;
}

export default function PostRaceAnalysis({ comparison }: PostRaceAnalysisProps) {
  const { prediction, liveData, deviations, accuracy } = comparison;

  // DEBUG: Log the data being received
  console.log('🏁 POST-RACE DEBUG:');
  console.log('Prediction:', prediction);
  console.log('Simulation Result:', prediction.simulationResult);
  console.log('Laps array:', prediction.simulationResult.laps);
  console.log('Laps count:', prediction.simulationResult.laps?.length);
  console.log('First 3 laps:', prediction.simulationResult.laps?.slice(0, 3));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-600">
        <h2 className="text-xl font-bold text-white mb-1">Post-Race Analysis</h2>
        <p className="text-sm text-purple-200">
          {prediction.raceName} - {prediction.raceDate}
        </p>
        <div className="mt-2 text-xs text-purple-300">
          Comparing prediction "{prediction.strategy.name}" {prediction.driverId ? `for driver ${prediction.driverId.toUpperCase()}` : ''} vs. actual race results
        </div>
      </div>

      {/* Accuracy Summary */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-lg font-bold mb-3 text-white">Prediction Accuracy</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Pit Stop Timing</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-400">
                {accuracy.pitStopAccuracy.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 pb-0.5">accurate</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Tire Choice</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-400">
                {accuracy.tireChoiceAccuracy.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 pb-0.5">accurate</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Race Time</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-400">
                {accuracy.timeAccuracy.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 pb-0.5">accurate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pit Stop Comparison */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-lg font-bold mb-3 text-white">Pit Stop Strategy</h3>
        <div className="space-y-2">
          {prediction.strategy.pitStops.map((predictedStop, index) => {
            const actualLap = liveData.pitStopLaps[index];
            const deviation = deviations.pitStopTiming[index];
            const isAccurate = Math.abs(deviation) <= 2;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 ${
                  isAccurate ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Pit Stop {index + 1}</span>
                  {isAccurate ? (
                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                      ACCURATE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">
                      {Math.abs(deviation)} LAP{Math.abs(deviation) !== 1 ? 'S' : ''} OFF
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Predicted</div>
                    <div className="text-white font-medium">
                      Lap {predictedStop.lap} → {predictedStop.tireCompound}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Actual</div>
                    <div className="text-white font-medium">
                      Lap {actualLap || 'N/A'} → {predictedStop.tireCompound}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lap Time Comparison Chart */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-lg font-bold mb-3 text-white">Lap Time Progression</h3>
        {/* DEBUG: Show lap count */}
        <div className="text-xs text-yellow-400 mb-2">
          DEBUG: {prediction.simulationResult.laps?.length || 0} laps in data
        </div>
        <div className="relative h-48 bg-gray-900 rounded p-3">
          {/* Simple visualization showing predicted vs actual lap times */}
          <div className="flex items-end justify-between h-full gap-0.5">
            {prediction.simulationResult.laps.slice(0, 57).map((lap, index) => {
              const predictedTime = lap.lapTime;
              const actualTime = predictedTime + deviations.lapTimeDelta;
              const maxTime = Math.max(
                ...prediction.simulationResult.laps.slice(0, 57).map(l => l.lapTime + Math.abs(deviations.lapTimeDelta))
              );
              const minTime = Math.min(
                ...prediction.simulationResult.laps.slice(0, 57).map(l => l.lapTime - Math.abs(deviations.lapTimeDelta))
              );
              const range = maxTime - minTime;

              const predictedHeight = ((predictedTime - minTime) / range) * 100;
              const actualHeight = ((actualTime - minTime) / range) * 100;

              const isPitLap = lap.isPitLap;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  {/* Actual time bar */}
                  <div
                    className="w-full bg-green-500/40 rounded-t"
                    style={{ height: `${actualHeight}%` }}
                  />
                  {/* Predicted time bar */}
                  <div
                    className={`w-full rounded-t ${isPitLap ? 'bg-yellow-500' : 'bg-blue-500/60'}`}
                    style={{ height: `${predictedHeight}%`, marginTop: `-${Math.min(predictedHeight, actualHeight)}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div>Lap {index + 1}{isPitLap ? ' (PIT)' : ''}</div>
                    <div>Predicted: {predictedTime.toFixed(2)}s</div>
                    <div>Actual: {actualTime.toFixed(2)}s</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500/60 rounded"></div>
              <span className="text-gray-300">Predicted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500/40 rounded"></div>
              <span className="text-gray-300">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Pit Lap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Race Time Comparison */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-lg font-bold mb-3 text-white">Race Time Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg p-3 border-2 border-blue-600">
            <div className="text-xs text-blue-300 mb-1 font-semibold">YOUR PREDICTION</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatRaceTime(prediction.simulationResult.totalRaceTime)}
            </div>
            <div className="text-xs text-blue-300 mt-1">
              Avg: {prediction.simulationResult.averageLapTime.toFixed(3)}s/lap
            </div>
            <div className="text-xs text-blue-300 mt-1">
              Fastest: {prediction.simulationResult.fastestLap.toFixed(3)}s
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-lg p-3 border-2 border-green-600">
            <div className="text-xs text-green-300 mb-1 font-semibold">ACTUAL RESULT</div>
            <div className="text-2xl font-bold text-green-400">
              {formatRaceTime(prediction.simulationResult.totalRaceTime + deviations.lapTimeDelta * 57)}
            </div>
            <div className="text-xs text-green-300 mt-1">
              Avg: {formatLapTime(prediction.simulationResult.averageLapTime + deviations.lapTimeDelta)}/lap
            </div>
            <div className="text-xs text-green-300 mt-1">
              Fastest: {formatLapTime(prediction.simulationResult.fastestLap + deviations.lapTimeDelta)}
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700 rounded">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-purple-200">
              Time Deviation:
            </div>
            <div className={`text-lg font-bold ${getTimeDeltaColor(deviations.lapTimeDelta)}`}>
              {formatTimeDelta(deviations.lapTimeDelta * 57)} total
              <span className="text-xs ml-2 text-gray-400">
                ({formatTimeDelta(deviations.lapTimeDelta)}/lap)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-100 mb-2">Analysis Insights</h3>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• Overall prediction accuracy: {((accuracy.pitStopAccuracy + accuracy.tireChoiceAccuracy + accuracy.timeAccuracy) / 3).toFixed(1)}%</li>
          <li>• Pit stop timing was within {Math.max(...deviations.pitStopTiming.map(Math.abs))} laps of actual</li>
          <li>• This demonstrates the simulator's ability to predict race strategies</li>
          <li>• During the 2025 season, you'll compare against real race data from FastF1</li>
        </ul>
      </div>
    </div>
  );
}
