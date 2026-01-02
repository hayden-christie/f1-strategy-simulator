'use client';

import { useState, useEffect } from 'react';
import RaceSelector from '@/components/RaceSelector';
import DriverSelector from '@/components/DriverSelector';
import ModeSelector from '@/components/ModeSelector';
import StrategyBuilder from '@/components/StrategyBuilder';
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
import { generateOptimalStrategies } from '@/lib/strategyGenerator';
import type { RacePrediction } from '@/lib/types';

export default function Home() {
  const [seasonData, setSeasonData] = useState<F1SeasonData | null>(null);
  const [selectedRace, setSelectedRace] = useState<F1Race | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Support for multiple strategies
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);

  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showOptimalStrategies, setShowOptimalStrategies] = useState(false);

  // Advanced configuration
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedRaceConfig>(
    createDefaultAdvancedConfig()
  );
  const [useAdvancedFeatures, setUseAdvancedFeatures] = useState(false);

  // Race mode and live features
  const [raceMode, setRaceMode] = useState<RaceMode>('PRE_RACE');
  const [liveAvailable, setLiveAvailable] = useState(false);

  // Saved predictions
  const [savedPredictions, setSavedPredictions] = useState<RacePrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<RacePrediction | null>(null);

  // Load F1 season data on mount
  useEffect(() => {
    fetch('/f1_season_data.json')
      .then((res) => res.json())
      .then((data: F1SeasonData) => {
        setSeasonData(data);
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
    setSimulationResults([]); // Clear previous results
    setStrategies([]); // Clear strategies
    setShowOptimalStrategies(false);
  };

  const handleStrategyChange = (strategy: Strategy) => {
    const newStrategies = [...strategies];
    newStrategies[currentStrategyIndex] = strategy;
    setStrategies(newStrategies);
  };

  const addNewStrategy = () => {
    if (strategies.length >= 3) {
      alert('Maximum 3 strategies can be compared');
      return;
    }
    setStrategies([...strategies, {
      name: `Strategy ${strategies.length + 1}`,
      startingCompound: 'MEDIUM',
      pitStops: [],
    }]);
    setCurrentStrategyIndex(strategies.length);
  };

  const removeStrategy = (index: number) => {
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

    // Take first 3 optimal strategies
    setStrategies(optimal.slice(0, 3));
    setCurrentStrategyIndex(0);
    setShowOptimalStrategies(true);
  };

  const runSimulation = () => {
    if (!selectedRace || strategies.length === 0) {
      alert('Please select a race and create at least one strategy');
      return;
    }

    setIsSimulating(true);

    // Simulate with a small delay for UI feedback
    setTimeout(() => {
      const totalLaps = getTotalLaps(selectedRace.name);
      const baseLapTime = getBaseLapTime(selectedRace.name);

      // Create race configuration
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

      // Run simulation for all strategies
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

    // Reload predictions
    const predictions = getAllPredictions();
    setSavedPredictions(predictions);

    alert(`✅ Prediction Saved Successfully!\n\nRace: ${selectedRace.name}\nStrategy: ${result.strategy.name}\nDriver: ${selectedDriver?.fullName || 'Not selected'}\n\nYou can view this prediction in Post-Race mode to compare against actual results.`);
  };

  const handlePredictionSelect = (prediction: RacePrediction) => {
    setSelectedPrediction(prediction);
  };

  const handlePredictionDelete = (predictionId: string) => {
    // Reload predictions
    const predictions = getAllPredictions();
    setSavedPredictions(predictions);

    // Clear selection if deleted prediction was selected
    if (selectedPrediction?.id === predictionId) {
      setSelectedPrediction(null);
    }
  };

  const handleClearSimulation = () => {
    if (confirm('Are you sure you want to clear all strategies and results?\n\nThis will reset your simulation but keep your selected race and driver.')) {
      setStrategies([]);
      setSimulationResults([]);
      setCurrentStrategyIndex(0);
      setShowOptimalStrategies(false);

      // Brief feedback
      const originalTitle = document.title;
      document.title = '✓ Simulation Cleared';
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    }
  };

  if (!seasonData) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-3 uppercase tracking-wider">Loading F1 Data...</div>
          <div className="w-48 h-1 bg-[#2a2a2a] rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-[#dc0000] to-[#14b8a6] animate-pulse"></div>
          </div>
          <div className="text-[#666666] mt-3 font-mono text-sm">Initializing telemetry systems</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] border-b-2 border-[#333333] shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-14 bg-gradient-to-b from-[#dc0000] via-[#e10600] to-[#dc0000] rounded-full shadow-lg shadow-red-900/50"></div>
            <div>
              <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider" style={{letterSpacing: '0.1em'}}>
                F1 Strategy Simulator
              </h1>
              <p className="text-[#14b8a6] text-sm font-mono tracking-wide font-semibold">
                2025 SEASON // TELEMETRY & STRATEGY ANALYSIS
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-3 py-4">
        {/* Full-Width Top Section: Input Controls */}
        <div className="space-y-3">
          {/* Row 1: Race Selection, Driver Selection, Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Race Selection */}
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide">Race Selection</h2>
              <RaceSelector
                races={seasonData.races}
                selectedRace={selectedRace}
                onRaceSelect={handleRaceSelect}
              />

              {selectedRace && raceMode === 'PRE_RACE' && (
                <button
                  onClick={loadOptimalStrategies}
                  className="w-full mt-2 px-3 py-1.5 text-sm bg-[#dc0000] text-white font-bold uppercase tracking-wide rounded hover:bg-[#e10600] transition-all hover:shadow-lg hover:shadow-red-900/50"
                >
                  Load Optimal Strategies
                </button>
              )}
            </div>

            {/* Driver Selection */}
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide">Driver Selection</h2>
              <DriverSelector
                selectedDriver={selectedDriver}
                onDriverSelect={setSelectedDriver}
              />
            </div>

            {/* Mode Selector */}
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide">Race Mode</h2>
              <ModeSelector
                currentMode={raceMode}
                onModeChange={setRaceMode}
                liveAvailable={liveAvailable}
              />
            </div>
          </div>

          {/* Row 2: Advanced Configuration (Full Width, Collapsible) */}
          {selectedRace && raceMode === 'PRE_RACE' && (
            <AdvancedConfig
              totalLaps={getTotalLaps(selectedRace.name)}
              config={advancedConfig}
              onChange={(newConfig) => {
                setAdvancedConfig(newConfig);
                // Enable advanced features if any feature is turned on
                const hasAnyFeature =
                  newConfig.enableWeather ||
                  newConfig.enableSafetyCar ||
                  newConfig.enableTireAllocation ||
                  newConfig.enableTraffic ||
                  newConfig.enhancedFuelEffect;
                setUseAdvancedFeatures(hasAnyFeature);
              }}
            />
          )}

          {/* Row 3: Strategy Builder (Full Width) */}
          {selectedRace && raceMode === 'PRE_RACE' && (
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">Strategy Builder ({strategies.length}/3)</h2>
                <button
                  onClick={addNewStrategy}
                  disabled={strategies.length >= 3}
                  className="px-3 py-1 bg-gradient-to-r from-[#14b8a6] to-[#0f9d8e] text-black text-xs font-bold uppercase rounded-lg shadow-md shadow-teal-900/30 hover:shadow-lg hover:shadow-teal-900/50 hover:from-[#0d9488] hover:to-[#0c7f73] transition-all duration-300 hover:-translate-y-0.5 disabled:bg-[#333333] disabled:text-[#666666] transition-all hover:shadow-lg hover:shadow-teal-900/50"
                >
                  + Add Strategy
                </button>
              </div>

              {/* Strategy tabs */}
              {strategies.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {strategies.map((strategy, index) => (
                    <div key={index} className="flex-shrink-0 relative group">
                      <button
                        onClick={() => setCurrentStrategyIndex(index)}
                        className={`px-3 py-2 pr-8 border-2 border-b-0 text-xs font-bold uppercase tracking-wide transition-all ${
                          currentStrategyIndex === index
                            ? 'bg-[#dc0000] border-[#dc0000] text-white shadow-lg shadow-red-900/50'
                            : 'bg-[#151515] border-[#333333] text-[#999999] hover:bg-[#1f1f1f] hover:border-[#444444]'
                        }`}
                      >
                        {strategy.name}
                      </button>
                      {strategies.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStrategy(index);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#dc0000] hover:text-[#ff0000] w-5 h-5 flex items-center justify-center font-bold"
                          aria-label="Remove strategy"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {strategies.length === 0 ? (
                <div className="text-center py-4 border-2 border-dashed border-[#333333] rounded">
                  <p className="text-sm text-[#666666] font-mono">NO STRATEGIES LOADED</p>
                  <p className="text-xs mt-1 text-[#444444]">Click "Add Strategy" or "Load Optimal"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {strategies.map((strategy, index) => (
                    <div key={index} className={currentStrategyIndex === index ? 'block' : 'hidden lg:block'}>
                      <StrategyBuilder
                        totalLaps={getTotalLaps(selectedRace.name)}
                        onStrategyChange={(newStrategy) => {
                          const newStrategies = [...strategies];
                          newStrategies[index] = newStrategy;
                          setStrategies(newStrategies);
                        }}
                        key={index}
                        initialStrategy={strategy}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 4: Action Buttons */}
          {selectedRace && raceMode === 'PRE_RACE' && strategies.length > 0 && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="px-8 py-3 bg-gradient-to-r from-[#dc0000] to-[#c50000] text-white font-bold uppercase tracking-wide rounded-lg shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/60 hover:from-[#e10600] hover:to-[#d00000] transition-all duration-300 hover:-translate-y-0.5 disabled:bg-[#333333] disabled:from-[#333333] disabled:to-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              >
                {isSimulating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Simulating...
                  </span>
                ) : (
                  `Run Simulation (${strategies.length} ${strategies.length === 1 ? 'Strategy' : 'Strategies'})`
                )}
              </button>
              <button
                onClick={handleClearSimulation}
                disabled={isSimulating}
                className="px-6 py-3 bg-transparent border-2 border-[#333333] text-[#999999] font-bold uppercase rounded-lg hover:bg-[#1f1f1f] hover:border-[#3a3a3a] hover:text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                title="Clear all strategies and results"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          )}

          {/* Saved Predictions Section */}
          {(raceMode === 'POST_RACE' || raceMode === 'PRE_RACE') && savedPredictions.length > 0 && (
            <SavedPredictions
              predictions={savedPredictions}
              onPredictionSelect={raceMode === 'POST_RACE' ? handlePredictionSelect : () => {}}
              onPredictionDelete={handlePredictionDelete}
              selectedPredictionId={raceMode === 'POST_RACE' ? selectedPrediction?.id : undefined}
            />
          )}

          {/* Empty State Messages for LIVE and POST_RACE modes */}
          {raceMode === 'LIVE' && simulationResults.length === 0 && (
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-3 text-white uppercase tracking-wide">Live Race Tracking</h2>
              <div className="p-6 border-2 border-dashed border-[#333333] rounded text-center">
                <div className="text-[#14b8a6] mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-bold text-white mb-2 uppercase tracking-wide text-sm">No Active Race</p>
                <p className="text-sm text-[#999999] mb-3 font-mono">
                  Live race tracking is available during the 2025 F1 season when races are in progress.
                </p>
                <p className="text-xs text-[#666666]">
                  During a live race, you'll see real-time lap times, pit stops, and tire strategies compared against your predictions.
                </p>
              </div>
            </div>
          )}

          {raceMode === 'POST_RACE' && !selectedPrediction && (
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-3 text-white uppercase tracking-wide">Post-Race Analysis</h2>
              <div className="p-6 border-2 border-dashed border-[#333333] rounded text-center">
                <div className="text-[#dc0000] mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-bold text-white mb-2 uppercase tracking-wide text-sm">Select a Saved Prediction</p>
                <p className="text-sm text-[#999999] mb-3 font-mono">
                  Choose a saved prediction from above to see post-race comparison.
                </p>
                <p className="text-xs text-[#666666] mb-3">
                  You can save predictions in Pre-Race mode by running simulations and clicking "Save Prediction".
                </p>
                <p className="text-xs text-[#14b8a6] font-bold">
                  → Try selecting Bahrain Grand Prix to see a demo of post-race analysis!
                </p>
              </div>
            </div>
          )}

          {raceMode === 'POST_RACE' && selectedPrediction && selectedPrediction.raceName !== 'Bahrain Grand Prix' && (
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <h2 className="text-sm font-bold mb-3 text-white uppercase tracking-wide">Post-Race Analysis</h2>
              <div className="p-6 border-2 border-dashed border-[#333333] rounded text-center">
                <div className="text-[#dc0000] mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-bold text-white mb-2 uppercase tracking-wide text-sm">Race Data Not Available</p>
                <p className="text-sm text-[#999999] mb-3 font-mono">
                  Actual race data for {selectedPrediction.raceName} is not available yet.
                </p>
                <p className="text-xs text-[#666666] mb-3">
                  Post-race comparisons will be available once the 2025 season begins and races are completed.
                </p>
                <p className="text-xs text-[#14b8a6] font-bold">
                  → Try Bahrain Grand Prix to see a demo!
                </p>
              </div>
            </div>
          )}

          {raceMode === 'POST_RACE' && selectedPrediction?.raceName === 'Bahrain Grand Prix' && hasDemoData(selectedPrediction.raceName) && (
            <PostRaceAnalysis comparison={getDemoComparison(selectedPrediction.raceName)!} />
          )}
        </div>

        {/* Visual Separator */}
        {simulationResults.length > 0 && (
          <div className="my-6 border-t-2 border-[#dc0000] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141414] px-4">
              <span className="text-xs font-bold text-[#dc0000] uppercase tracking-wider">Simulation Results</span>
            </div>
          </div>
        )}

        {/* Full-Width Results Section */}
        {simulationResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {/* Results Header with Save Buttons */}
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333333] p-4 shadow-lg hover:shadow-xl hover:border-[#3a3a3a] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Simulation Results</h2>
                  <p className="text-xs text-[#999999] font-mono">{simulationResults.length} {simulationResults.length === 1 ? 'strategy' : 'strategies'} analyzed</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {simulationResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSavePrediction(index)}
                      className="px-3 py-1.5 bg-[#14b8a6] text-black text-xs font-bold uppercase tracking-wide rounded hover:bg-[#0d9488] transition-all hover:shadow-lg hover:shadow-teal-900/50 flex items-center gap-1.5"
                      title={`Save ${result.strategy.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save {simulationResults.length > 1 ? `#${index + 1}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lap Time Chart - Full Width */}
            <LapTimeChart results={simulationResults} />

            {/* Strategy Comparison Grid - Full Width */}
            <StrategyComparison results={simulationResults} />
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 bg-[#151515] border-2 border-[#dc0000] rounded p-3">
          <div className="flex items-start gap-2">
            <div className="w-1 h-full bg-gradient-to-b from-[#dc0000] to-[#e10600] flex-shrink-0"></div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">About the Simulator</h3>
              <p className="text-xs text-[#cccccc] leading-relaxed">
                Realistic F1 performance models including tire degradation, fuel load effects, and pit stop times.
                Compare up to 3 strategies side-by-side with lap-by-lap analysis. All lap counts based on official 2025 F1 race distances.
              </p>
              {useAdvancedFeatures && (
                <div className="mt-2 pt-2 border-t border-[#333333]">
                  <h4 className="font-bold text-[#14b8a6] mb-1 text-xs uppercase tracking-wide">Advanced Features Active:</h4>
                  <ul className="text-xs text-[#999999] flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
                    {advancedConfig.enhancedFuelEffect && <li>→ Enhanced fuel effect (~0.03-0.05s/kg)</li>}
                    {advancedConfig.enableWeather && <li>→ Weather system with wet tire compounds</li>}
                    {advancedConfig.enableSafetyCar && <li>→ Safety car periods with reduced pit time loss</li>}
                    {advancedConfig.enableTireAllocation && <li>→ Tire allocation limits</li>}
                    {advancedConfig.enableTraffic && <li>→ Traffic & overtaking difficulty</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
