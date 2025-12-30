'use client';

import { SimulationResult } from '@/lib/types';
import { formatRaceTime, formatTimeDelta } from '@/lib';
import { useState } from 'react';

interface StrategyComparisonProps {
  results: SimulationResult[];
}

export default function StrategyComparison({ results }: StrategyComparisonProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [expandedStints, setExpandedStints] = useState<Set<number>>(new Set());
  const [expandedLaps, setExpandedLaps] = useState<Set<number>>(new Set());

  if (results.length === 0) {
    return null;
  }

  // Find the winner (fastest time)
  const winner = results.reduce((fastest, current) =>
    current.totalRaceTime < fastest.totalRaceTime ? current : fastest
  );

  // Sort results by total time
  const sortedResults = [...results].sort((a, b) => a.totalRaceTime - b.totalRaceTime);

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const toggleStints = (index: number) => {
    const newExpanded = new Set(expandedStints);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStints(newExpanded);
  };

  const toggleLaps = (index: number) => {
    const newExpanded = new Set(expandedLaps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLaps(newExpanded);
  };

  const getTireColor = (compound: string): string => {
    switch (compound) {
      case 'SOFT':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-400';
      case 'HARD':
        return 'bg-white border border-gray-300';
      default:
        return 'bg-gray-400';
    }
  };

  // Calculate stint information for a result
  const calculateStints = (result: SimulationResult) => {
    const stints: Array<{
      number: number;
      startLap: number;
      endLap: number;
      compound: string;
      lapCount: number;
      averageLapTime: number;
      totalDegradation: number;
      degradationRate: number;
    }> = [];

    let currentStintStart = 0;
    let stintNumber = 1;

    result.pitStops.forEach((stop) => {
      const stintLaps = result.laps.slice(currentStintStart, stop.lap);
      const nonPitLaps = stintLaps.filter((lap) => !lap.isPitLap);

      if (nonPitLaps.length > 0) {
        const avgTime = nonPitLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / nonPitLaps.length;
        const firstLapTime = nonPitLaps[0].lapTime;
        const lastLapTime = nonPitLaps[nonPitLaps.length - 1].lapTime;
        const totalDegradation = lastLapTime - firstLapTime;
        const degradationRate = totalDegradation / nonPitLaps.length;

        stints.push({
          number: stintNumber,
          startLap: currentStintStart + 1,
          endLap: stop.lap,
          compound: stintLaps[0]?.tireCompound || 'N/A',
          lapCount: nonPitLaps.length,
          averageLapTime: avgTime,
          totalDegradation,
          degradationRate,
        });
      }

      stintNumber++;
      currentStintStart = stop.lap;
    });

    // Add final stint
    const finalStintLaps = result.laps.slice(currentStintStart);
    const finalNonPitLaps = finalStintLaps.filter((lap) => !lap.isPitLap);

    if (finalNonPitLaps.length > 0) {
      const avgTime = finalNonPitLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / finalNonPitLaps.length;
      const firstLapTime = finalNonPitLaps[0].lapTime;
      const lastLapTime = finalNonPitLaps[finalNonPitLaps.length - 1].lapTime;
      const totalDegradation = lastLapTime - firstLapTime;
      const degradationRate = totalDegradation / finalNonPitLaps.length;

      stints.push({
        number: stintNumber,
        startLap: currentStintStart + 1,
        endLap: result.laps[result.laps.length - 1].lapNumber,
        compound: finalStintLaps[0]?.tireCompound || 'N/A',
        lapCount: finalNonPitLaps.length,
        averageLapTime: avgTime,
        totalDegradation,
        degradationRate,
      });
    }

    return stints;
  };

  return (
    <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Strategy Comparison</h3>
        <div className="flex items-center gap-2 text-xs font-mono text-[#999999]">
          <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#333333]">{sortedResults.length} {sortedResults.length === 1 ? 'STRATEGY' : 'STRATEGIES'}</span>
        </div>
      </div>

      {/* Grid Layout - responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedResults.map((result, index) => {
          const isWinner = result === winner;
          const timeDelta = result.totalRaceTime - winner.totalRaceTime;
          const isExpanded = expandedCards.has(index);
          const isStintsExpanded = expandedStints.has(index);
          const isLapsExpanded = expandedLaps.has(index);
          const stints = calculateStints(result);

          return (
            <div
              key={index}
              className={`rounded-lg border-2 transition-all duration-300 hover:shadow-2xl ${
                isWinner
                  ? 'border-[#14b8a6] bg-gradient-to-b from-[#14b8a6]/10 to-[#14b8a6]/5 shadow-xl shadow-teal-900/40 hover:shadow-teal-900/60'
                  : 'border-[#333333] bg-[#1a1a1a] shadow-lg hover:border-[#3a3a3a]'
              }`}
            >
              {/* Header with position and winner badge */}
              <div className={`p-3 border-b-2 ${isWinner ? 'border-[#14b8a6]/20' : 'border-[#333333]'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                      isWinner
                        ? 'bg-[#14b8a6] text-black'
                        : 'bg-[#2a2a2a] text-[#999999]'
                    }`}>
                      {index + 1}
                    </div>
                    {isWinner && (
                      <span className="px-2 py-0.5 bg-[#14b8a6] text-black text-xs font-bold uppercase rounded">
                        FASTEST
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-mono font-bold truncate ${
                      isWinner ? 'text-[#14b8a6]' : 'text-white'
                    }`}>
                      {formatRaceTime(result.totalRaceTime)}
                    </div>
                    {!isWinner && (
                      <div className="text-xs text-[#dc0000] font-mono font-bold">
                        +{formatTimeDelta(timeDelta)}
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wide truncate">
                  {result.strategy.name}
                </h4>
              </div>

              {/* Key Metrics Grid */}
              <div className="p-3 grid grid-cols-2 gap-2">
                <div className="bg-[#1a1a1a] rounded p-2 border border-[#333333]">
                  <div className="text-xs text-[#999999] uppercase font-bold mb-1">Pit Stops</div>
                  <div className="text-base font-bold text-white font-mono">{result.pitStops.length}</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 border border-[#333333]">
                  <div className="text-xs text-[#999999] uppercase font-bold mb-1">Avg Lap</div>
                  <div className="text-base font-bold text-white font-mono truncate">{result.averageLapTime.toFixed(2)}s</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 border border-[#333333]">
                  <div className="text-xs text-[#999999] uppercase font-bold mb-1">Fastest</div>
                  <div className="text-base font-bold text-[#14b8a6] font-mono truncate">{result.fastestLap.toFixed(2)}s</div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 border border-[#333333]">
                  <div className="text-xs text-[#999999] uppercase font-bold mb-1">Slowest</div>
                  <div className="text-base font-bold text-[#dc0000] font-mono truncate">{result.slowestLap.toFixed(2)}s</div>
                </div>
              </div>

              {/* Tire Strategy */}
              <div className="px-3 pb-3">
                <div className="bg-[#1a1a1a] rounded p-2 border border-[#333333]">
                  <div className="text-xs text-[#999999] uppercase font-bold mb-2">Tire Strategy</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getTireColor(result.strategy.startingCompound)}`} />
                      <span className="text-xs text-white font-bold">{result.strategy.startingCompound}</span>
                    </div>
                    {result.pitStops.map((ps, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[#666666]">→</span>
                        <div className={`w-3 h-3 rounded-full ${getTireColor(ps.toCompound)}`} />
                        <span className="text-xs text-white font-bold">{ps.toCompound}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collapsible Detail Buttons */}
              <div className="px-3 pb-3 space-y-2">
                <button
                  onClick={() => toggleStints(index)}
                  className="w-full px-3 py-1.5 bg-[#2a2a2a] text-[#999999] text-xs font-bold uppercase rounded hover:bg-[#333333] hover:text-white transition-all"
                >
                  {isStintsExpanded ? '▲ Hide Stint Analysis' : '▼ Show Stint Analysis'}
                </button>

                <button
                  onClick={() => toggleLaps(index)}
                  className="w-full px-3 py-1.5 bg-[#2a2a2a] text-[#999999] text-xs font-bold uppercase rounded hover:bg-[#333333] hover:text-white transition-all"
                >
                  {isLapsExpanded ? '▲ Hide Lap Times' : '▼ Show Lap Times'}
                </button>

                {result.pitStops.length > 0 && (
                  <button
                    onClick={() => toggleCard(index)}
                    className="w-full px-3 py-1.5 bg-[#2a2a2a] text-[#999999] text-xs font-bold uppercase rounded hover:bg-[#333333] hover:text-white transition-all"
                  >
                    {isExpanded ? '▲ Hide Pit Details' : '▼ Show Pit Details'}
                  </button>
                )}
              </div>

              {/* Stint Analysis */}
              {isStintsExpanded && (
                <div className="px-3 pb-3 border-t border-[#333333] pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-[#14b8a6] uppercase">Stint Breakdown</div>
                    <div className="text-xs text-[#666666] font-mono">Tire Degradation Analysis</div>
                  </div>
                  <div className="space-y-2">
                    {stints.map((stint) => (
                      <div
                        key={stint.number}
                        className="px-2 py-2 bg-[#1a1a1a] border border-[#333333] rounded"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#999999] font-bold">STINT {stint.number}</span>
                            <div className={`w-3 h-3 rounded-full ${getTireColor(stint.compound)}`} />
                            <span className="text-xs text-white font-bold">{stint.compound}</span>
                          </div>
                          <span className="text-xs text-[#999999] font-mono">
                            Laps {stint.startLap}-{stint.endLap} ({stint.lapCount})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#666666]">AVG TIME:</span>
                            <span className="text-white font-bold">{stint.averageLapTime.toFixed(3)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#666666]">TOTAL DEG:</span>
                            <span className={`font-bold ${stint.totalDegradation > 1.0 ? 'text-[#dc0000]' : 'text-[#14b8a6]'}`}>
                              +{stint.totalDegradation.toFixed(3)}s
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 pt-1 border-t border-[#333333]">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#666666]">DEG RATE (per lap):</span>
                            <span className={`font-bold ${stint.degradationRate > 0.05 ? 'text-[#dc0000]' : 'text-[#14b8a6]'}`}>
                              +{stint.degradationRate.toFixed(4)}s/lap
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-[#141414] rounded border border-[#333333]">
                    <p className="text-xs text-[#999999] font-mono">
                      <span className="text-[#14b8a6] font-bold">DEG RATE</span> = Tire degradation per lap (time loss rate)
                    </p>
                  </div>
                </div>
              )}

              {/* Lap-by-Lap Times */}
              {isLapsExpanded && (
                <div className="px-3 pb-3 border-t border-[#333333] pt-3">
                  <div className="text-xs font-bold text-[#14b8a6] uppercase mb-2">Lap-by-Lap Times</div>
                  <div className="max-h-64 overflow-y-auto border border-[#333333] rounded">
                    <table className="w-full text-xs font-mono">
                      <thead className="sticky top-0 bg-[#1a1a1a] border-b border-[#333333]">
                        <tr>
                          <th className="px-2 py-1 text-left text-[#999999] font-bold">LAP</th>
                          <th className="px-2 py-1 text-left text-[#999999] font-bold">TIRE</th>
                          <th className="px-2 py-1 text-right text-[#999999] font-bold">TIME</th>
                          <th className="px-2 py-1 text-right text-[#999999] font-bold">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.laps.map((lap) => (
                          <tr
                            key={lap.lapNumber}
                            className={`border-t border-[#333333] hover:bg-[#1a1a1a] ${
                              lap.isPitLap ? 'bg-[#dc0000]/10' : ''
                            }`}
                          >
                            <td className="px-2 py-1 text-white font-bold">{lap.lapNumber}</td>
                            <td className="px-2 py-1">
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getTireColor(lap.tireCompound)}`} />
                                <span className="text-[#999999] text-xs">{lap.tireCompound.slice(0, 3)}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1 text-right">
                              {lap.isPitLap ? (
                                <span className="text-[#dc0000] font-bold">{lap.lapTime.toFixed(3)}s</span>
                              ) : (
                                <span className="text-white">{lap.lapTime.toFixed(3)}s</span>
                              )}
                            </td>
                            <td className="px-2 py-1 text-right text-[#999999]">
                              {formatRaceTime(lap.cumulativeTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.pitStops.length > 0 && (
                    <div className="mt-2 p-2 bg-[#dc0000]/10 rounded border border-[#dc0000]/30">
                      <p className="text-xs text-[#999999] font-mono">
                        <span className="text-[#dc0000] font-bold">RED ROWS</span> = Pit stop laps (includes pit lane time)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pit Stop Details */}
              {isExpanded && result.pitStops.length > 0 && (
                <div className="px-3 pb-3 border-t border-[#333333] pt-3">
                  <div className="text-xs font-bold text-[#14b8a6] uppercase mb-2">Pit Stop Details</div>
                  <div className="space-y-1">
                    {result.pitStops.map((stop, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#999999]">STOP {i + 1}</span>
                          <span className="text-white font-bold">LAP {stop.lap}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${getTireColor(stop.fromCompound)}`} />
                            <span className="text-[#666666]">→</span>
                            <div className={`w-3 h-3 rounded-full ${getTireColor(stop.toCompound)}`} />
                          </div>
                          <span className="text-[#dc0000] font-bold">+{stop.duration.toFixed(2)}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Analysis */}
      {results.length > 1 && (
        <div className="mt-4 p-3 bg-[#1a1a1a] border-2 border-[#14b8a6] rounded">
          <div className="flex items-start gap-2">
            <div className="w-1 h-full bg-gradient-to-b from-[#14b8a6] to-[#0d9488] flex-shrink-0"></div>
            <div className="flex-1">
              <h4 className="font-bold text-[#14b8a6] mb-2 text-xs uppercase tracking-wide">Race Analysis</h4>
              <div className="text-xs text-white space-y-1 font-mono">
                <p>
                  → Fastest strategy: <strong className="text-[#14b8a6]">{winner.strategy.name}</strong> ({formatRaceTime(winner.totalRaceTime)})
                </p>
                {sortedResults.length > 1 && (
                  <p>
                    → Time gap (1st to {sortedResults.length}th): <strong className="text-[#dc0000]">
                      +{(sortedResults[sortedResults.length - 1].totalRaceTime - winner.totalRaceTime).toFixed(3)} seconds
                    </strong>
                  </p>
                )}
                <p>
                  → Winner stats: {winner.pitStops.length} pit {winner.pitStops.length === 1 ? 'stop' : 'stops'}, {winner.averageLapTime.toFixed(3)}s average lap time
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
