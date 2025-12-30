'use client';

import { useState, useEffect, useRef } from 'react';
import { Strategy, TireCompound } from '@/lib/types';

interface PitStopInput {
  id: string;
  lap: number;
  tireCompound: TireCompound;
}

interface StrategyBuilderProps {
  totalLaps: number;
  onStrategyChange: (strategy: Strategy) => void;
  initialStrategy?: Strategy;
}

export default function StrategyBuilder({
  totalLaps,
  onStrategyChange,
  initialStrategy,
}: StrategyBuilderProps) {
  const [strategyName, setStrategyName] = useState(initialStrategy?.name || 'My Strategy');
  const [startingCompound, setStartingCompound] = useState<TireCompound>(
    initialStrategy?.startingCompound || 'MEDIUM'
  );
  const [pitStops, setPitStops] = useState<PitStopInput[]>(
    initialStrategy?.pitStops.map((ps) => ({
      id: Math.random().toString(36).substr(2, 9),
      lap: ps.lap,
      tireCompound: ps.tireCompound,
    })) || []
  );

  // Update when initialStrategy changes - use a ref to track if we've initialized
  const initializedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only update if initialStrategy is new (different ID/name)
    const strategyId = initialStrategy ? `${initialStrategy.name}_${initialStrategy.pitStops.length}` : undefined;

    if (initialStrategy && strategyId !== initializedRef.current) {
      initializedRef.current = strategyId;
      setStrategyName(initialStrategy.name);
      setStartingCompound(initialStrategy.startingCompound);
      setPitStops(
        initialStrategy.pitStops.map((ps) => ({
          id: Math.random().toString(36).substr(2, 9),
          lap: ps.lap,
          tireCompound: ps.tireCompound,
        }))
      );
    }
  }, [initialStrategy]);

  const tireCompounds: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD'];

  const addPitStop = () => {
    const newPitStop: PitStopInput = {
      id: Math.random().toString(36).substr(2, 9),
      lap: Math.floor(totalLaps / 2),
      tireCompound: 'MEDIUM',
    };
    setPitStops([...pitStops, newPitStop]);
  };

  const removePitStop = (id: string) => {
    setPitStops(pitStops.filter((ps) => ps.id !== id));
  };

  const updatePitStop = (id: string, field: 'lap' | 'tireCompound', value: number | TireCompound) => {
    setPitStops(
      pitStops.map((ps) => (ps.id === id ? { ...ps, [field]: value } : ps))
    );
  };

  const buildStrategy = (): Strategy => {
    const sortedPitStops = [...pitStops].sort((a, b) => a.lap - b.lap);
    return {
      name: strategyName,
      startingCompound,
      pitStops: sortedPitStops.map((ps) => ({
        lap: ps.lap,
        tireCompound: ps.tireCompound,
      })),
    };
  };

  // Auto-apply strategy changes
  useEffect(() => {
    const strategy = buildStrategy();
    onStrategyChange(strategy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyName, startingCompound, pitStops]);

  const getTireColor = (compound: TireCompound): string => {
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

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="strategy-name" className="block text-xs font-bold mb-1 text-white uppercase tracking-wide">
          Strategy Name
        </label>
        <input
          id="strategy-name"
          type="text"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded focus:ring-2 focus:ring-[#dc0000] focus:border-[#dc0000] font-mono"
          placeholder="ENTER STRATEGY NAME"
        />
      </div>

      <div>
        <label htmlFor="starting-compound" className="block text-xs font-bold mb-1 text-white uppercase tracking-wide">
          Starting Tire
        </label>
        <div className="flex gap-2">
          {tireCompounds.map((compound) => (
            <button
              key={compound}
              onClick={() => setStartingCompound(compound)}
              className={`flex-1 px-2 py-2 rounded border-2 transition-all text-xs ${
                startingCompound === compound
                  ? 'border-[#dc0000] bg-[#dc0000] text-white shadow-lg shadow-red-900/50'
                  : 'border-[#2a2a2a] bg-[#0a0a0a] hover:border-[#444444] text-[#999999]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <div className={`w-4 h-4 rounded-full ${getTireColor(compound)}`} />
                <span className="font-bold uppercase">{compound}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-white uppercase tracking-wide">Pit Stops</label>
          <button
            onClick={addPitStop}
            className="px-2 py-1 text-xs bg-[#14b8a6] text-black font-bold uppercase rounded hover:bg-[#0d9488] transition-all hover:shadow-lg hover:shadow-teal-900/50"
          >
            + Add
          </button>
        </div>

        {pitStops.length === 0 ? (
          <div className="p-3 border-2 border-dashed border-[#2a2a2a] rounded text-center">
            <p className="text-xs text-[#666666] font-mono uppercase">No pit stops configured</p>
            <p className="text-xs text-[#444444] mt-1">Click "Add" to create strategy</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pitStops
              .sort((a, b) => a.lap - b.lap)
              .map((pitStop, index) => (
                <div
                  key={pitStop.id}
                  className="p-2 border border-[#2a2a2a] rounded bg-[#0a0a0a]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#14b8a6] uppercase tracking-wide">Stop {index + 1}</span>
                    <button
                      onClick={() => removePitStop(pitStop.id)}
                      className="text-[#dc0000] hover:text-[#ff0000] text-xs font-bold uppercase"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 text-[#999999] uppercase font-bold">Lap</label>
                      <input
                        type="number"
                        min="1"
                        max={totalLaps}
                        value={pitStop.lap}
                        onChange={(e) =>
                          updatePitStop(pitStop.id, 'lap', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 bg-[#151515] border border-[#2a2a2a] text-white rounded text-sm font-mono focus:ring-2 focus:ring-[#dc0000] focus:border-[#dc0000]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1 text-[#999999] uppercase font-bold">Tire</label>
                      <select
                        value={pitStop.tireCompound}
                        onChange={(e) =>
                          updatePitStop(pitStop.id, 'tireCompound', e.target.value as TireCompound)
                        }
                        className="w-full px-2 py-1.5 bg-[#151515] border border-[#2a2a2a] text-white rounded text-sm font-bold uppercase focus:ring-2 focus:ring-[#dc0000] focus:border-[#dc0000]"
                      >
                        {tireCompounds.map((compound) => (
                          <option key={compound} value={compound}>
                            {compound}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-[#151515] border-2 border-[#14b8a6] rounded">
        <div className="flex items-start gap-2">
          <div className="w-1 h-full bg-gradient-to-b from-[#14b8a6] to-[#0d9488] flex-shrink-0"></div>
          <div className="flex-1">
            <h4 className="text-xs font-bold mb-2 text-[#14b8a6] uppercase tracking-wide">Strategy Preview</h4>
            <div className="text-xs text-white space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[#999999]">TOTAL LAPS:</span>
                <span className="font-bold text-white">{totalLaps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999999]">STARTING TIRE:</span>
                <span className="font-bold text-white">{startingCompound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999999]">PIT STOPS:</span>
                <span className="font-bold text-white">{pitStops.length}</span>
              </div>
              {pitStops.length > 0 && (
                <div className="pt-2 border-t border-[#2a2a2a]">
                  <p className="font-bold mb-2 text-[#14b8a6] uppercase text-xs">Stint Breakdown:</p>
                  {(() => {
                    const sortedStops = [...pitStops].sort((a, b) => a.lap - b.lap);
                    const stints: Array<{ compound: string; start: number; end: number; laps: number }> = [];

                    // First stint
                    stints.push({
                      compound: startingCompound,
                      start: 1,
                      end: sortedStops[0]?.lap || totalLaps,
                      laps: (sortedStops[0]?.lap || totalLaps),
                    });

                    // Middle stints
                    for (let i = 0; i < sortedStops.length - 1; i++) {
                      stints.push({
                        compound: sortedStops[i].tireCompound,
                        start: sortedStops[i].lap + 1,
                        end: sortedStops[i + 1].lap,
                        laps: sortedStops[i + 1].lap - sortedStops[i].lap,
                      });
                    }

                    // Final stint
                    if (sortedStops.length > 0) {
                      const lastStop = sortedStops[sortedStops.length - 1];
                      stints.push({
                        compound: lastStop.tireCompound,
                        start: lastStop.lap + 1,
                        end: totalLaps,
                        laps: totalLaps - lastStop.lap,
                      });
                    }

                    return stints.map((stint, i) => (
                      <div key={i} className="text-xs py-1 flex justify-between items-center">
                        <span className="text-[#999999]">STINT {i + 1}:</span>
                        <span className="text-white font-bold">
                          {stint.compound} ({stint.laps} {stint.laps === 1 ? 'LAP' : 'LAPS'})
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
