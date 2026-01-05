'use client';

import { useState, useEffect } from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import TimelineStrategyBuilder from '@/components/TimelineStrategyBuilder';
import ResultsDisplay from '@/components/ResultsDisplay';
import LapTimeChart from '@/components/LapTimeChart';
import StrategyComparison from '@/components/StrategyComparison';
import AdvancedConfig from '@/components/AdvancedConfig';
import PostRaceAnalysis from '@/components/PostRaceAnalysis';
import SavedPredictions from '@/components/SavedPredictions';
import { F1SeasonData, F1Race } from '@/types/f1-data';
import { Strategy, SimulationResult, RaceConfiguration, AdvancedRaceConfig, RaceMode } from '@/lib/types';
import { simulateRace, simulateAdvancedRace, getPitLaneTimeLoss, createDefaultAdvancedConfig, hasDemoData, getDemoComparison, savePrediction, generatePredictionId, getAllPredictions } from '@/lib';
import { getTotalLaps, getBaseLapTime } from '@/lib/raceData';
import { generateOptimalStrategies } from '@/lib/strategyGenerator';
import { F1_DRIVERS_2025, Driver } from '@/lib/driverTeamData';
import { colors } from '@/lib/designSystem';
import type { RacePrediction } from '@/lib/types';

export default function Home() {
  const [seasonData, setSeasonData] = useState<F1SeasonData | null>(null);
  const [selectedRace, setSelectedRace] = useState<F1Race | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Multiple strategies support
  const [strategies, setStrategies] = useState<Strategy[]>([{
    name: 'Strategy A',
    startingCompound: 'MEDIUM',
    pitStops: [],
  }]);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);

  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Advanced configuration
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedRaceConfig>(
    createDefaultAdvancedConfig()
  );
  const [useAdvancedFeatures, setUseAdvancedFeatures] = useState(false);
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);

  // Race mode
  const [raceMode, setRaceMode] = useState<RaceMode>('PRE_RACE');

  // Saved predictions
  const [savedPredictions, setSavedPredictions] = useState<RacePrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<RacePrediction | null>(null);

  // Load F1 season data on mount
  useEffect(() => {
    fetch('/f1_season_data.json')
      .then((res) => res.json())
      .then((data: F1SeasonData) => {
        setSeasonData(data);
        // Auto-select first race
        if (data.races.length > 0) {
          setSelectedRace(data.races[0]);
        }
      })
      .catch((error) => {
        console.error('Failed to load F1 season data:', error);
      });
  }, []);

  // Load saved predictions on mount
  useEffect(() => {
    const predictions = getAllPredictions();
    setSavedPredictions(predictions);
  }, []);

  const handleRaceSelect = (race: F1Race) => {
    setSelectedRace(race);
    setSimulationResults([]);
    setStrategies([{
      name: 'Strategy A',
      startingCompound: 'MEDIUM',
      pitStops: [],
    }]);
    setCurrentStrategyIndex(0);
  };

  const addNewStrategy = () => {
    if (strategies.length >= 3) {
      alert('Maximum 3 strategies can be compared');
      return;
    }
    const letters = ['A', 'B', 'C'];
    setStrategies([...strategies, {
      name: `Strategy ${letters[strategies.length]}`,
      startingCompound: 'MEDIUM',
      pitStops: [],
    }]);
    setCurrentStrategyIndex(strategies.length);
  };

  const removeStrategy = (index: number) => {
    if (strategies.length === 1) {
      alert('At least one strategy is required');
      return;
    }
    const newStrategies = strategies.filter((_, i) => i !== index);
    setStrategies(newStrategies);
    if (currentStrategyIndex >= newStrategies.length) {
      setCurrentStrategyIndex(Math.max(0, newStrategies.length - 1));
    }
  };

  const loadOptimalStrategies = () => {
    if (!selectedRace) return;

    const totalLaps = getTotalLaps(selectedRace.name);
    const optimal = generateOptimalStrategies(totalLaps, selectedRace.name);

    setStrategies(optimal.slice(0, 3));
    setCurrentStrategyIndex(0);
  };

  const runSimulation = () => {
    if (!selectedRace || strategies.length === 0) {
      alert('Please select a race and create at least one strategy');
      return;
    }

    setIsSimulating(true);

    setTimeout(() => {
      const totalLaps = getTotalLaps(selectedRace.name);
      const baseLapTime = getBaseLapTime(selectedRace.name);

      const raceConfig: RaceConfiguration = {
        trackName: selectedRace.name,
        baseLapTime,
        totalLaps,
        pitLaneTimeLoss: getPitLaneTimeLoss(selectedRace.name),
        pitStopStationary: 2.2,
        startingFuelLoad: 110,
        fuelPerLap: 1.9,
        fuelEffect: 0.025,
        driverId: selectedDriver?.id,
        teamId: selectedDriver?.teamId,
        advanced: useAdvancedFeatures ? advancedConfig : undefined,
      };

      const results = strategies.map((strategy) =>
        useAdvancedFeatures
          ? simulateAdvancedRace(strategy, raceConfig)
          : simulateRace(strategy, raceConfig)
      );
      setSimulationResults(results);
      setIsSimulating(false);
    }, 500);
  };

  const handleSavePrediction = (resultIndex: number) => {
    if (!selectedRace || !simulationResults[resultIndex]) {
      alert('No simulation result to save');
      return;
    }

    const result = simulationResults[resultIndex];
    const totalLaps = getTotalLaps(selectedRace.name);
    const baseLapTime = getBaseLapTime(selectedRace.name);

    const prediction: RacePrediction = {
      id: generatePredictionId(selectedRace.name, selectedDriver?.id),
      raceName: selectedRace.name,
      raceDate: selectedRace.date,
      savedAt: new Date(),
      strategy: result.strategy,
      simulationResult: result,
      driverId: selectedDriver?.id,
      teamId: selectedDriver?.teamId,
      raceConfig: {
        trackName: selectedRace.name,
        baseLapTime,
        totalLaps,
        pitLaneTimeLoss: getPitLaneTimeLoss(selectedRace.name),
        pitStopStationary: 2.2,
        startingFuelLoad: 110,
        fuelPerLap: 1.9,
        fuelEffect: 0.025,
        driverId: selectedDriver?.id,
        teamId: selectedDriver?.teamId,
        advanced: useAdvancedFeatures ? advancedConfig : undefined,
      },
    };

    savePrediction(prediction);

    const predictions = getAllPredictions();
    setSavedPredictions(predictions);

    alert(`✅ Prediction Saved!\n\nRace: ${selectedRace.name}\nStrategy: ${result.strategy.name}\nDriver: ${selectedDriver?.fullName || 'Not selected'}`);
  };

  const handlePredictionSelect = (prediction: RacePrediction) => {
    setSelectedPrediction(prediction);
  };

  const handlePredictionDelete = (predictionId: string) => {
    const predictions = getAllPredictions();
    setSavedPredictions(predictions);

    if (selectedPrediction?.id === predictionId) {
      setSelectedPrediction(null);
    }
  };

  // Calculate main content margin based on sidebar states
  const getMainMargin = () => {
    const leftMargin = leftSidebarOpen ? '280px' : '64px';
    const rightMargin = rightSidebarOpen ? '320px' : '0px';
    return { marginLeft: leftMargin, marginRight: rightMargin };
  };

  if (!seasonData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg.main }}>
        <div className="text-center">
          <div className="text-xl font-bold mb-3 uppercase tracking-wider" style={{ color: colors.text.primary }}>
            Loading F1 Data...
          </div>
          <div className="w-48 h-1 rounded-full overflow-hidden mx-auto" style={{ backgroundColor: colors.bg.sidebar }}>
            <div className="h-full bg-gradient-to-r from-red-600 to-teal-500 animate-pulse"></div>
          </div>
          <div className="mt-3 font-mono text-sm" style={{ color: colors.text.secondary }}>
            Initializing telemetry systems
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg.main }}>
      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        currentMode={raceMode}
        onModeChange={setRaceMode}
        selectedRace={selectedRace}
        onRaceSelect={handleRaceSelect}
        races={seasonData.races}
        selectedDriver={selectedDriver}
        onDriverSelect={setSelectedDriver}
        drivers={F1_DRIVERS_2025}
        savedPredictions={savedPredictions}
      />

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        currentMode={raceMode}
        selectedRace={selectedRace?.name || null}
      />

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={getMainMargin()}
      >
        {/* Top Bar - Sticky */}
        <div
          className="sticky top-0 z-30 px-4 py-3 border-b transition-all duration-300"
          style={{
            backgroundColor: colors.bg.sidebar,
            borderColor: colors.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center justify-between max-w-[1200px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
              <span style={{ color: colors.accent.teal }}>🏎️</span>
              <span>{raceMode === 'PRE_RACE' ? 'Pre-Race' : raceMode === 'LIVE' ? 'Live' : 'Post-Race'}</span>
              {selectedRace && (
                <>
                  <span>/</span>
                  <span style={{ color: colors.text.primary }}>{selectedRace.name}</span>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {raceMode === 'PRE_RACE' && selectedRace && (
                <>
                  <button
                    onClick={loadOptimalStrategies}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: colors.accent.purple,
                      color: 'white',
                    }}
                  >
                    Load Optimal
                  </button>
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: colors.accent.red,
                      color: 'white',
                    }}
                  >
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </button>
                  {simulationResults.length > 0 && (
                    <div className="flex gap-1">
                      {simulationResults.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleSavePrediction(index)}
                          className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                          style={{
                            backgroundColor: colors.accent.teal,
                            color: 'white',
                          }}
                          title={`Save ${strategies[index].name}`}
                        >
                          💾 {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 max-w-[1200px] mx-auto space-y-4">
          {/* Pre-Race Mode */}
          {raceMode === 'PRE_RACE' && selectedRace && (
            <>
              {/* Strategy Builder with Tabs */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.bg.card,
                  border: `1px solid ${colors.border.default}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold" style={{ color: colors.text.primary }}>
                    Strategy Builder ({strategies.length}/3)
                  </h3>
                  <button
                    onClick={addNewStrategy}
                    disabled={strategies.length >= 3}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                    style={{
                      backgroundColor: colors.accent.teal,
                      color: 'white',
                    }}
                  >
                    + Add Strategy
                  </button>
                </div>

                {/* Strategy Tabs */}
                {strategies.length > 1 && (
                  <div className="flex gap-1 mb-3 overflow-x-auto">
                    {strategies.map((strategy, index) => (
                      <div key={index} className="relative group">
                        <button
                          onClick={() => setCurrentStrategyIndex(index)}
                          className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                            currentStrategyIndex === index ? '' : 'opacity-60 hover:opacity-80'
                          }`}
                          style={{
                            backgroundColor: currentStrategyIndex === index ? colors.accent.blue : colors.bg.input,
                            color: colors.text.primary,
                          }}
                        >
                          {strategy.name}
                        </button>
                        {strategies.length > 1 && (
                          <button
                            onClick={() => removeStrategy(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                              backgroundColor: colors.accent.red,
                              color: 'white',
                            }}
                            title="Remove strategy"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <TimelineStrategyBuilder
                  strategy={strategies[currentStrategyIndex]}
                  totalLaps={getTotalLaps(selectedRace.name)}
                  onUpdateStrategy={(newStrategy) => {
                    const newStrategies = [...strategies];
                    newStrategies[currentStrategyIndex] = newStrategy;
                    setStrategies(newStrategies);
                  }}
                />
              </div>

              {/* Advanced Configuration - Collapsible */}
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: colors.bg.card,
                  border: `1px solid ${colors.border.default}`,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
                <button
                  onClick={() => setAdvancedConfigOpen(!advancedConfigOpen)}
                  className="w-full flex items-center justify-between text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: colors.text.primary }}
                >
                  <span>⚙️ Advanced Configuration</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${advancedConfigOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {advancedConfigOpen && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border.default }}>
                    <AdvancedConfig
                      totalLaps={getTotalLaps(selectedRace.name)}
                      config={advancedConfig}
                      onChange={(newConfig) => {
                        setAdvancedConfig(newConfig);
                        const hasAnyFeature =
                          newConfig.enableWeather ||
                          newConfig.enableSafetyCar ||
                          newConfig.enableTireAllocation ||
                          newConfig.enableTraffic ||
                          newConfig.enhancedFuelEffect;
                        setUseAdvancedFeatures(hasAnyFeature);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Simulation Results */}
              {simulationResults.length > 0 && (
                <div className="space-y-4">
                  <LapTimeChart results={simulationResults} />
                  <StrategyComparison results={simulationResults} />
                </div>
              )}
            </>
          )}

          {/* Live Mode */}
          {raceMode === 'LIVE' && (
            <div
              className="p-12 rounded-lg text-center"
              style={{
                backgroundColor: colors.bg.card,
                border: `1px solid ${colors.border.default}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="text-6xl mb-4">🔴</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
                Live Mode
              </h3>
              <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                Real-time race tracking coming in 2026
              </p>
              <p className="text-xs" style={{ color: colors.text.muted }}>
                Track live race data and compare against your predictions during F1 race weekends
              </p>
            </div>
          )}

          {/* Post-Race Mode */}
          {raceMode === 'POST_RACE' && (
            <>
              {savedPredictions.length > 0 && (
                <SavedPredictions
                  predictions={savedPredictions}
                  onPredictionSelect={handlePredictionSelect}
                  onPredictionDelete={handlePredictionDelete}
                  selectedPredictionId={selectedPrediction?.id}
                />
              )}

              {!selectedPrediction && savedPredictions.length === 0 && (
                <div
                  className="p-12 rounded-lg text-center"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    No Saved Predictions
                  </h3>
                  <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                    Save predictions in Pre-Race mode to analyze them here
                  </p>
                  <p className="text-xs" style={{ color: colors.text.muted }}>
                    Run simulations and click "Save Prediction" to track your strategy predictions
                  </p>
                </div>
              )}

              {selectedPrediction && selectedPrediction.raceName === 'Bahrain Grand Prix' && hasDemoData(selectedPrediction.raceName) && (
                <PostRaceAnalysis comparison={getDemoComparison(selectedPrediction.raceName)!} />
              )}

              {selectedPrediction && selectedPrediction.raceName !== 'Bahrain Grand Prix' && (
                <div
                  className="p-8 rounded-lg"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.text.primary }}>
                    Race Data Not Available
                  </h3>
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    Actual race data for {selectedPrediction.raceName} will be available when the 2026 season begins.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
