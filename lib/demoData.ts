/**
 * Demo Data for Post-Race Analysis
 *
 * Sample data from a 2025 race to demonstrate the post-race comparison feature
 */

import { RacePrediction, DriverLiveData, LiveComparison, LapData } from './types';

/**
 * Generate realistic lap-by-lap data for demo purposes
 * Simulates Bahrain GP with Medium → Hard → Medium tire strategy
 */
function generateDemoLapData(): LapData[] {
  console.log('🔧 generateDemoLapData() called - generating 57 laps');
  const laps: LapData[] = [];
  let cumulativeTime = 0;

  // Strategy: Medium (0-17), Pit (18), Hard (19-37), Pit (38), Medium (39-57)
  const baseLapTime = 90.0;
  const fuelPerLap = 1.9;
  const fuelEffect = 0.025; // s/kg
  const startingFuel = 110;

  for (let lapNum = 1; lapNum <= 57; lapNum++) {
    let compound: 'SOFT' | 'MEDIUM' | 'HARD' = 'MEDIUM';
    let tireAge = lapNum - 1;
    let isPitLap = false;
    let lapTime = baseLapTime;

    // Determine compound and tire age based on strategy
    if (lapNum <= 17) {
      compound = 'MEDIUM';
      tireAge = lapNum - 1;
    } else if (lapNum === 18) {
      // Pit lap
      compound = 'MEDIUM';
      tireAge = lapNum - 1;
      isPitLap = true;
      lapTime = baseLapTime + 22.3; // Add pit stop time
    } else if (lapNum <= 37) {
      compound = 'HARD';
      tireAge = lapNum - 19; // Reset tire age after pit stop
    } else if (lapNum === 38) {
      // Pit lap
      compound = 'HARD';
      tireAge = lapNum - 19;
      isPitLap = true;
      lapTime = baseLapTime + 22.1; // Add pit stop time
    } else {
      compound = 'MEDIUM';
      tireAge = lapNum - 39; // Reset tire age after second pit stop
    }

    // Calculate realistic lap time (if not pit lap)
    if (!isPitLap) {
      // Fuel effect (car gets lighter)
      const fuelLoad = Math.max(0, startingFuel - (lapNum - 1) * fuelPerLap);
      const fuelPenalty = fuelLoad * fuelEffect;

      // Tire degradation (simplified U-shaped pattern)
      let tireDeg = 0;
      if (tireAge < 3) {
        // Warm-up phase (slightly slower)
        tireDeg = (3 - tireAge) * 0.15;
      } else {
        // Degradation phase
        const degradationRate = compound === 'MEDIUM' ? 0.05 : 0.03; // MEDIUM or HARD
        tireDeg = tireAge * degradationRate + Math.pow(tireAge / 15, 2) * tireAge * degradationRate * 0.10;
      }

      // Compound base offset
      const compoundOffset = compound === 'MEDIUM' ? 0.18 : 0.36; // MEDIUM or HARD

      lapTime = baseLapTime + compoundOffset + tireDeg + fuelPenalty;

      // Add some realistic variation (deterministic based on lap number)
      lapTime += Math.sin(lapNum * 0.7) * 0.2;
    }

    cumulativeTime += lapTime;

    // Calculate fuel load for this lap
    const fuelLoad = Math.max(0, startingFuel - (lapNum - 1) * fuelPerLap);

    laps.push({
      lapNumber: lapNum,
      lapTime,
      cumulativeTime,
      tireCompound: compound,
      tireAge,
      fuelLoad,
      isPitLap,
      pitStopDuration: isPitLap ? (lapNum === 18 ? 22.3 : 22.1) : undefined,
    });
  }

  console.log(`✅ Generated ${laps.length} laps. First lap:`, laps[0]);
  console.log(`✅ Last lap:`, laps[laps.length - 1]);

  return laps;
}

/**
 * Demo prediction for Bahrain Grand Prix 2025
 * This represents what a user might have predicted before the race
 */
export const DEMO_BAHRAIN_PREDICTION: RacePrediction = {
  id: 'demo_bahrain_2025_verstappen',
  raceName: 'Bahrain Grand Prix',
  raceDate: '2025-03-02',
  savedAt: new Date('2025-03-01T18:00:00Z'),
  driverId: 'ver',
  teamId: 'redbull',
  strategy: {
    name: 'Predicted Optimal Strategy',
    startingCompound: 'MEDIUM',
    pitStops: [
      { lap: 18, tireCompound: 'HARD' },
      { lap: 38, tireCompound: 'MEDIUM' },
    ],
  },
  simulationResult: {
    strategy: {
      name: 'Predicted Optimal Strategy',
      startingCompound: 'MEDIUM',
      pitStops: [
        { lap: 18, tireCompound: 'HARD' },
        { lap: 38, tireCompound: 'MEDIUM' },
      ],
    },
    totalRaceTime: 5124.5, // 1:25:24.5
    laps: generateDemoLapData(), // Generated realistic lap-by-lap data
    pitStops: [
      { lap: 18, fromCompound: 'MEDIUM', toCompound: 'HARD', duration: 22.3 },
      { lap: 38, fromCompound: 'HARD', toCompound: 'MEDIUM', duration: 22.1 },
    ],
    averageLapTime: 89.5,
    fastestLap: 87.2,
    slowestLap: 112.5,
  },
  raceConfig: {
    trackName: 'Bahrain Grand Prix',
    baseLapTime: 88.0,
    totalLaps: 57,
    pitLaneTimeLoss: 20.0,
    pitStopStationary: 2.2,
    startingFuelLoad: 110,
    fuelPerLap: 1.9,
    fuelEffect: 0.035,
    driverId: 'ver',
    teamId: 'redbull',
  },
};

/**
 * Demo actual race data for Bahrain Grand Prix 2025
 * This represents what actually happened in the race
 */
export const DEMO_BAHRAIN_ACTUAL: DriverLiveData = {
  driverId: 'ver',
  position: 1,
  currentLap: 57,
  currentTire: 'MEDIUM',
  tireAge: 19,
  lastLapTime: 88.9,
  pitStopCount: 2,
  pitStopLaps: [19, 40], // Actual pit stops were slightly different
  status: 'FINISHED',
};

/**
 * Generate comparison data between prediction and actual results
 */
export function generateDemoComparison(): LiveComparison {
  const prediction = DEMO_BAHRAIN_PREDICTION;
  const actual = DEMO_BAHRAIN_ACTUAL;

  // Calculate deviations
  const pitStopTiming = prediction.strategy.pitStops.map((ps, index) => {
    const actualLap = actual.pitStopLaps[index] || 0;
    return ps.lap - actualLap; // Predicted - Actual
  });

  // For demo, assume tire choices were correct
  const tireChoice: { lap: number; predicted: any; actual: any }[] = [];

  // Calculate pit stop accuracy (closer to 0 = better)
  const pitStopAccuracy = pitStopTiming.reduce((acc, diff) => {
    const lapDiff = Math.abs(diff);
    return acc + (lapDiff <= 2 ? 100 : lapDiff <= 5 ? 80 : 60);
  }, 0) / pitStopTiming.length;

  // Tire choice accuracy (100% for demo since they match)
  const tireChoiceAccuracy = 100;

  // Time accuracy (within 1% of predicted time)
  const actualRaceTime = 5142.8; // Slightly slower than predicted
  const timeDiff = Math.abs(prediction.simulationResult.totalRaceTime - actualRaceTime);
  const timeAccuracy = Math.max(0, 100 - (timeDiff / prediction.simulationResult.totalRaceTime * 100) * 10);

  return {
    prediction,
    liveData: actual,
    deviations: {
      pitStopTiming,
      tireChoice,
      lapTimeDelta: (actualRaceTime - prediction.simulationResult.totalRaceTime) / 57, // Average per lap
    },
    accuracy: {
      pitStopAccuracy,
      tireChoiceAccuracy,
      timeAccuracy,
    },
  };
}

/**
 * Check if demo data is available for a race
 */
export function hasDemoData(raceName: string): boolean {
  return raceName === 'Bahrain Grand Prix';
}

/**
 * Get demo comparison for a race
 */
export function getDemoComparison(raceName: string): LiveComparison | null {
  if (raceName === 'Bahrain Grand Prix') {
    return generateDemoComparison();
  }
  return null;
}
