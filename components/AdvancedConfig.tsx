'use client';

import { useState } from 'react';
import { AdvancedRaceConfig, WeatherCondition, SafetyCarPeriod, WeatherChange } from '@/lib/types';
import { generateRandomSafetyCarPeriod, generateRandomWeatherChanges } from '@/lib/advancedSimulator';
import { formatTimeDelta } from '@/lib';

interface AdvancedConfigProps {
  totalLaps: number;
  config: AdvancedRaceConfig;
  onChange: (config: AdvancedRaceConfig) => void;
}

export default function AdvancedConfig({ totalLaps, config, onChange }: AdvancedConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<AdvancedRaceConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addSafetyCarPeriod = () => {
    const newPeriod = generateRandomSafetyCarPeriod(totalLaps);
    updateConfig({
      safetyCarPeriods: [...config.safetyCarPeriods, newPeriod],
    });
  };

  const removeSafetyCarPeriod = (index: number) => {
    const newPeriods = config.safetyCarPeriods.filter((_, i) => i !== index);
    updateConfig({ safetyCarPeriods: newPeriods });
  };

  const addWeatherChange = () => {
    const randomChanges = generateRandomWeatherChanges(totalLaps);
    updateConfig({
      weatherChanges: [...config.weatherChanges, ...randomChanges],
    });
  };

  const removeWeatherChange = (index: number) => {
    const newChanges = config.weatherChanges.filter((_, i) => i !== index);
    updateConfig({ weatherChanges: newChanges });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-lg font-bold text-white">Advanced Configuration</h2>
        <span className="text-xl text-gray-400">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-3">
          {/* Enhanced Fuel Effect */}
          <div className="border-t border-gray-700 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="text-sm font-semibold text-white">Enhanced Fuel Effect</h3>
                <p className="text-xs text-gray-400">
                  Cars get faster as fuel burns off (~0.03-0.05s/kg)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enhancedFuelEffect}
                  onChange={(e) => updateConfig({ enhancedFuelEffect: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {config.enhancedFuelEffect && (
              <div>
                <label className="text-xs text-gray-300">Fuel Effect (s/kg)</label>
                <input
                  type="number"
                  step="0.001"
                  value={config.fuelEffectPerKg}
                  onChange={(e) => updateConfig({ fuelEffectPerKg: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs mt-0.5"
                />
              </div>
            )}
          </div>

          {/* Weather System */}
          <div className="border-t border-gray-700 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="text-sm font-semibold text-white">Weather System</h3>
                <p className="text-xs text-gray-400">
                  Rain/wet conditions with appropriate tire compounds
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableWeather}
                  onChange={(e) => updateConfig({ enableWeather: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {config.enableWeather && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-300">Initial Weather</label>
                  <select
                    value={config.initialWeather}
                    onChange={(e) =>
                      updateConfig({ initialWeather: e.target.value as WeatherCondition })
                    }
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs mt-0.5"
                  >
                    <option value="DRY">Dry</option>
                    <option value="LIGHT_RAIN">Light Rain</option>
                    <option value="HEAVY_RAIN">Heavy Rain</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-300">Weather Changes</label>
                    <button
                      onClick={addWeatherChange}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      + Add Random
                    </button>
                  </div>
                  {config.weatherChanges.length === 0 ? (
                    <p className="text-xs text-gray-400">No weather changes</p>
                  ) : (
                    <div className="space-y-2">
                      {config.weatherChanges.map((change, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600"
                        >
                          <span className="text-sm text-white">
                            Lap {change.lap}: {change.condition.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => removeWeatherChange(i)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Safety Car */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Safety Car Periods</h3>
                <p className="text-xs text-gray-400">
                  'Free' pit stops during SC (reduced time loss)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableSafetyCar}
                  onChange={(e) => updateConfig({ enableSafetyCar: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {config.enableSafetyCar && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300">SC Pit Time Loss (s)</label>
                  <input
                    type="number"
                    value={config.safetyCarPitTimeLoss}
                    onChange={(e) =>
                      updateConfig({ safetyCarPitTimeLoss: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-300">SC Periods</label>
                    <button
                      onClick={addSafetyCarPeriod}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      + Add Random
                    </button>
                  </div>
                  {config.safetyCarPeriods.length === 0 ? (
                    <p className="text-xs text-gray-400">No safety car periods</p>
                  ) : (
                    <div className="space-y-2">
                      {config.safetyCarPeriods.map((period, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600"
                        >
                          <span className="text-sm text-white">
                            Laps {period.startLap}-{period.endLap} ({formatTimeDelta(period.lapTimeDelta)}/lap)
                          </span>
                          <button
                            onClick={() => removeSafetyCarPeriod(i)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tire Allocation */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Tire Allocation</h3>
                <p className="text-xs text-gray-400">
                  Limit available tire sets (like real F1)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableTireAllocation}
                  onChange={(e) => updateConfig({ enableTireAllocation: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {config.enableTireAllocation && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-300">Soft Sets</label>
                  <input
                    type="number"
                    min="0"
                    value={config.tireAllocation.soft}
                    onChange={(e) =>
                      updateConfig({
                        tireAllocation: {
                          ...config.tireAllocation,
                          soft: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Medium Sets</label>
                  <input
                    type="number"
                    min="0"
                    value={config.tireAllocation.medium}
                    onChange={(e) =>
                      updateConfig({
                        tireAllocation: {
                          ...config.tireAllocation,
                          medium: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Hard Sets</label>
                  <input
                    type="number"
                    min="0"
                    value={config.tireAllocation.hard}
                    onChange={(e) =>
                      updateConfig({
                        tireAllocation: {
                          ...config.tireAllocation,
                          hard: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Inter Sets</label>
                  <input
                    type="number"
                    min="0"
                    value={config.tireAllocation.intermediate}
                    onChange={(e) =>
                      updateConfig({
                        tireAllocation: {
                          ...config.tireAllocation,
                          intermediate: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Wet Sets</label>
                  <input
                    type="number"
                    min="0"
                    value={config.tireAllocation.wet}
                    onChange={(e) =>
                      updateConfig({
                        tireAllocation: {
                          ...config.tireAllocation,
                          wet: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Traffic */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Traffic Effects</h3>
                <p className="text-xs text-gray-400">
                  Time loss when stuck in traffic / overtaking difficulty
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableTraffic}
                  onChange={(e) => updateConfig({ enableTraffic: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {config.enableTraffic && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300">
                    Overtaking Difficulty (0-10): {config.overtakingDifficulty}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.overtakingDifficulty}
                    onChange={(e) =>
                      updateConfig({ overtakingDifficulty: parseInt(e.target.value) })
                    }
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Easy</span>
                    <span>Hard</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Traffic Time Loss/Lap (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.trafficTimeLossPerLap}
                    onChange={(e) =>
                      updateConfig({ trafficTimeLossPerLap: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm mt-1"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
