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
import { simulateRace, simulateAdvancedRace, getPitLaneTimeLoss, createDefaultAdvancedConfig, Driver, hasDemoData, getDemoComparison, savePrediction, generatePredictionId, getAllPredictions } from '@/lib';
import { getTotalLaps, getBaseLapTime } from '@/lib/raceData';
import { colors } from '@/lib/designSystem';
import type { RacePrediction } from '@/lib/types';

export default function Home() {
  const [seasonData, setSeasonData] = useState<F1SeasonData | null>(null);
  const [selectedRace, setSelectedRace] = useState<F1Race | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Strategy management
  const [strategy, setStrategy] = useState<Strategy>({
    name: 'My Strategy',
    startingCompound: 'MEDIUM',
    pitStops: [],
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Advanced configuration
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedRaceConfig>(
    createDefaultAdvancedConfig()
  );
  const [useAdvancedFeatures, setUseAdvancedFeatures] = useState(false);

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
    setSimulationResult(null);
    setStrategy({
      name: 'My Strategy',
      startingCompound: 'MEDIUM',
      pitStops: [],
    });
  };

  const runSimulation = () => {
    if (!selectedRace) {
      alert('Please select a race');
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

      const result = useAdvancedFeatures
        ? simulateAdvancedRace(strategy, raceConfig)
        : simulateRace(strategy, raceConfig);

      setSimulationResult(result);
      setIsSimulating(false);
    }, 500);
  };

  const handleSavePrediction = () => {
    if (!selectedRace || !simulationResult) {
      alert('No simulation result to save');
      return;
    }

    const totalLaps = getTotalLaps(selectedRace.name);
    const baseLapTime = getBaseLapTime(selectedRace.name);

    const prediction: RacePrediction = {
      id: generatePredictionId(selectedRace.name, selectedDriver?.id),
      raceName: selectedRace.name,
      raceDate: selectedRace.date,
      savedAt: new Date(),
      strategy: simulationResult.strategy,
      simulationResult: simulationResult,
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

    alert(`✅ Prediction Saved Successfully!\n\nRace: ${selectedRace.name}\nStrategy: ${simulationResult.strategy.name}\nDriver: ${selectedDriver?.fullName || 'Not selected'}`);
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
        selectedRace={selectedRace?.name || null}
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
          className="sticky top-0 z-30 p-4 border-b transition-all duration-300"
          style={{
            backgroundColor: colors.bg.sidebar,
            borderColor: colors.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center justify-between max-w-[900px] mx-auto">
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
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: colors.accent.red,
                      color: 'white',
                    }}
                  >
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </button>
                  {simulationResult && (
                    <button
                      onClick={handleSavePrediction}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: colors.accent.teal,
                        color: 'white',
                      }}
                    >
                      Save Prediction
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 max-w-[900px] mx-auto space-y-6">
          {/* Pre-Race Mode */}
          {raceMode === 'PRE_RACE' && selectedRace && (
            <>
              {/* Strategy Builder */}
              <TimelineStrategyBuilder
                strategy={strategy}
                totalLaps={getTotalLaps(selectedRace.name)}
                onUpdateStrategy={setStrategy}
              />

              {/* Advanced Configuration */}
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: colors.bg.card,
                  border: `1px solid ${colors.border.default}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
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

              {/* Simulation Results */}
              {simulationResult && (
                <div className="space-y-6">
                  <div
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: colors.bg.card,
                      border: `1px solid ${colors.border.default}`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
                      Simulation Results
                    </h3>
                    <ResultsDisplay result={simulationResult} />
                  </div>

                  <LapTimeChart results={[simulationResult]} />
                  <StrategyComparison results={[simulationResult]} />
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
