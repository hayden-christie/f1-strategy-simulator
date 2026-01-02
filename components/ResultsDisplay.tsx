'use client';

import { SimulationResult } from '@/lib/types';
import { formatRaceTime, formatLapTime, formatTimeDelta, getTimeDeltaColor } from '@/lib';
import { Tooltip, InfoLabel } from './Tooltip';

interface ResultsDisplayProps {
  result: SimulationResult | null;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-600 rounded-lg text-center text-gray-400">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No simulation results yet</p>
        <p className="text-sm mt-2 text-gray-500">
          Build a strategy and run simulation to see results
        </p>
        <p className="text-xs mt-4 text-gray-600">
          Results will show total race time, lap times, pit stops, and tire strategy analysis
        </p>
      </div>
    );
  }

  // Calculate stint information
  const stints: Array<{
    number: number;
    startLap: number;
    endLap: number;
    compound: string;
    lapCount: number;
    averageLapTime: number;
  }> = [];

  let currentStintStart = 0;
  let stintNumber = 1;

  result.pitStops.forEach((stop) => {
    const stintLaps = result.laps.slice(currentStintStart, stop.lap);
    const nonPitLaps = stintLaps.filter((lap) => !lap.isPitLap);

    if (nonPitLaps.length > 0) {
      const avgTime =
        nonPitLaps.reduce((sum: number, lap) => sum + lap.lapTime, 0) / nonPitLaps.length;

      stints.push({
        number: stintNumber,
        startLap: currentStintStart + 1,
        endLap: stop.lap,
        compound: stintLaps[0]?.tireCompound || 'N/A',
        lapCount: nonPitLaps.length,
        averageLapTime: avgTime,
      });
    }

    stintNumber++;
    currentStintStart = stop.lap;
  });

  // Add final stint
  const finalStintLaps = result.laps.slice(currentStintStart);
  const finalNonPitLaps = finalStintLaps.filter((lap) => !lap.isPitLap);

  if (finalNonPitLaps.length > 0) {
    const avgTime =
      finalNonPitLaps.reduce((sum: number, lap) => sum + lap.lapTime, 0) / finalNonPitLaps.length;

    stints.push({
      number: stintNumber,
      startLap: currentStintStart + 1,
      endLap: result.laps[result.laps.length - 1].lapNumber,
      compound: finalStintLaps[0]?.tireCompound || 'N/A',
      lapCount: finalNonPitLaps.length,
      averageLapTime: avgTime,
    });
  }

  const getTireColor = (compound: string): string => {
    switch (compound) {
      case 'SOFT':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-400';
      case 'HARD':
        return 'bg-white border border-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">{result.strategy.name}</h2>
        <div className="text-3xl font-mono font-bold">
          {formatRaceTime(result.totalRaceTime)}
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">Pit Stops</div>
          <div className="text-2xl font-bold text-white">{result.pitStops.length}</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">
            <InfoLabel
              label="Average Lap"
              tooltip="Average lap time across the entire race (excluding pit stops)"
            />
          </div>
          <div className="text-2xl font-bold text-white">{result.averageLapTime.toFixed(2)}s</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">Fastest Lap</div>
          <div className="text-2xl font-bold text-white">{result.fastestLap.toFixed(2)}s</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">Slowest Lap</div>
          <div className="text-2xl font-bold text-white">{result.slowestLap.toFixed(2)}s</div>
        </div>
      </div>

      {/* Pit Stops */}
      {result.pitStops.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">Pit Stops</h3>
          <div className="space-y-2">
            {result.pitStops.map((stop, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold text-gray-300">Stop {index + 1}</div>
                  <div className="text-sm">
                    <span className="font-medium text-white">Lap {stop.lap}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full ${getTireColor(stop.fromCompound)}`} />
                    <span className="text-gray-400">→</span>
                    <div className={`w-4 h-4 rounded-full ${getTireColor(stop.toCompound)}`} />
                  </div>
                  <div className="text-sm text-gray-300">
                    {stop.fromCompound} → {stop.toCompound}
                  </div>
                </div>
                <div className={`text-sm font-mono font-medium ${getTimeDeltaColor(stop.duration)}`}>
                  {formatTimeDelta(stop.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stint Breakdown */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-white">Stint Breakdown</h3>
        <div className="space-y-2">
          {stints.map((stint) => (
            <div
              key={stint.number}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white">Stint {stint.number}</div>
                  <div className={`w-4 h-4 rounded-full ${getTireColor(stint.compound)}`} />
                  <div className="text-sm font-medium text-gray-300">{stint.compound}</div>
                </div>
                <div className="text-sm text-gray-300">
                  Laps {stint.startLap}-{stint.endLap} ({stint.lapCount} laps)
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  <InfoLabel
                    label="Avg Lap"
                    tooltip="Average lap time for this stint (lower is faster)"
                  />
                </span>
                <span className="font-mono font-medium text-white">{stint.averageLapTime.toFixed(3)}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lap Times Table */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-white">Lap Times</h3>
        <div className="max-h-96 overflow-y-auto border border-gray-600 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-200">Lap</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-200">Tire</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-200">Age</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-200">Time</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-200">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {result.laps.map((lap) => (
                <tr
                  key={lap.lapNumber}
                  className={`border-t border-gray-600 hover:bg-gray-700 ${
                    lap.isPitLap ? 'bg-yellow-900' : ''
                  }`}
                >
                  <td className="px-4 py-2 font-medium text-white">{lap.lapNumber}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTireColor(lap.tireCompound)}`} />
                      <span className="text-xs text-gray-300">{lap.tireCompound}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{lap.tireAge}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {lap.isPitLap ? (
                      <span className="text-[#ef4444]">{formatLapTime(lap.lapTime)} (PIT)</span>
                    ) : (
                      <span className="text-white">{formatLapTime(lap.lapTime)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-300">
                    {formatRaceTime(lap.cumulativeTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
