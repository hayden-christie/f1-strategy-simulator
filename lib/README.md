# F1 Strategy Simulator Engine

A comprehensive Formula 1 race strategy simulation engine that models tire degradation, fuel consumption, pit stops, and lap times with realistic F1 values.

## Features

### 🏎️ Tire Degradation Model
- **Three compounds**: Soft, Medium, Hard
- **Realistic degradation rates**:
  - Soft: 4.5% per lap, optimal for 0-20 laps
  - Medium: 2.5% per lap, optimal for 0-30 laps
  - Hard: 1.5% per lap, optimal for 0-45 laps
- **Non-linear degradation**: Performance cliff after optimal range
- **Compound performance differences**: ~0.3s/lap between compounds

### ⏱️ Lap Time Calculator
- **Base lap time**: Clean air, new tires, light fuel
- **Tire age penalty**: Increases exponentially with tire wear
- **Fuel load effect**: ~0.035s per kg (realistic F1 value)
- **Starting fuel**: 110kg with ~1.9kg consumption per lap

### 🛑 Pit Stop Model
- **Stationary time**: 2.0-2.5 seconds (tire change)
- **Pit lane time loss**: 15-25 seconds (track-dependent)
- **Track-specific values**: Monaco (15s), Bahrain (22s), Yas Marina (25s)
- **Total pit stop cost**: ~17-27.5 seconds

### 🏁 Race Simulator
- **Full race simulation**: Lap-by-lap calculation
- **Strategy comparison**: Test multiple strategies simultaneously
- **Strategy optimization**: Find optimal pit stop laps
- **Detailed statistics**: Average lap, fastest lap, cumulative times

## Usage

### Basic Example

```typescript
import {
  createDefaultRaceConfig,
  createStrategyTemplates,
  compareStrategies,
  formatRaceTime,
} from '@/lib';

// Create race configuration
const raceConfig = createDefaultRaceConfig('Monaco', 78);

// Generate strategy templates
const strategies = createStrategyTemplates(78);

// Compare strategies
const comparison = compareStrategies(strategies, raceConfig);

// Get results
console.log('Winner:', comparison.winner.strategy.name);
console.log('Time:', formatRaceTime(comparison.winner.totalRaceTime));
```

### Custom Strategy

```typescript
import { simulateRace, type Strategy } from '@/lib';

// Define a custom strategy
const customStrategy: Strategy = {
  name: 'My Strategy',
  startingCompound: 'SOFT',
  pitStops: [
    { lap: 18, tireCompound: 'MEDIUM' },
    { lap: 38, tireCompound: 'SOFT' },
  ],
};

// Simulate the race
const result = simulateRace(customStrategy, raceConfig);

// Analyze results
console.log('Total time:', result.totalRaceTime);
console.log('Pit stops:', result.pitStops.length);
console.log('Average lap:', result.averageLapTime);
```

### Analyze Tire Performance

```typescript
import {
  createTireState,
  getTireTimePenalty,
  TIRE_COMPOUNDS,
} from '@/lib';

// Create tire state
const softTire = createTireState('SOFT', 15); // 15 laps old

// Calculate time penalty
const penalty = getTireTimePenalty(90.0, softTire);
console.log('Time penalty:', penalty, 'seconds');

// Get compound data
const softData = TIRE_COMPOUNDS.SOFT;
console.log('Degradation rate:', softData.degradationRate);
console.log('Optimal range:', softData.optimalLapRange);
```

## API Reference

### Race Configuration

```typescript
interface RaceConfiguration {
  trackName: string;           // Track identifier
  baseLapTime: number;         // Seconds - clean air, new tires
  totalLaps: number;           // Race distance
  pitLaneTimeLoss: number;     // Seconds lost in pit lane
  pitStopStationary: number;   // Seconds for tire change
  startingFuelLoad: number;    // kg - full tank
  fuelPerLap: number;          // kg consumed per lap
  fuelEffect: number;          // seconds per kg
}
```

### Strategy Definition

```typescript
interface Strategy {
  name: string;                // Strategy identifier
  startingCompound: TireCompound;
  pitStops: Array<{
    lap: number;
    tireCompound: TireCompound;
  }>;
}
```

### Simulation Result

```typescript
interface SimulationResult {
  strategy: Strategy;
  totalRaceTime: number;       // Total seconds
  laps: LapData[];            // Lap-by-lap data
  pitStops: PitStop[];        // Pit stop details
  averageLapTime: number;     // Seconds
  fastestLap: number;         // Seconds
  slowestLap: number;         // Seconds
}
```

## Realistic F1 Values

All values are calibrated to match real Formula 1 performance:

### Tire Compounds
- **Soft (Red)**: Fastest but degrades quickly
  - ~0.5-0.7s faster than Medium
  - Lasts 15-25 laps optimally
  - Used for qualifying and short stints

- **Medium (Yellow)**: Balanced performance
  - ~0.3s slower than Soft
  - Lasts 25-35 laps optimally
  - Most common race tire

- **Hard (White)**: Most durable
  - ~0.6s slower than Soft
  - Lasts 35-50 laps optimally
  - Used for long stints

### Pit Stops
- **Stationary time**: 2.0-2.5s (world record: 1.82s by Red Bull)
- **Pit lane time loss**: Varies by track
  - Short: Monaco (15s), Zandvoort (16.5s)
  - Medium: Silverstone (20s), Spa (21s)
  - Long: COTA (23s), Yas Marina (25s)

### Fuel Effect
- **Weight penalty**: ~0.035s per kg
- **Starting fuel**: ~110kg
- **Consumption**: ~1.9kg per lap
- **Total effect**: ~3.85s slower at start vs. end

## Examples

See `example.ts` for detailed usage examples:
- Basic strategy comparison
- Detailed race analysis
- Custom strategy testing
- Tire degradation analysis

## Integration with Next.js App

```typescript
// In a Next.js component or API route
import { compareStrategies, createDefaultRaceConfig } from '@/lib';

export default function StrategyAnalyzer() {
  const runSimulation = () => {
    const config = createDefaultRaceConfig('Monaco', 78);
    const strategies = createStrategyTemplates(78);
    const results = compareStrategies(strategies, config);

    return results;
  };

  // Use in your component...
}
```

## Performance Notes

- Simulating a single race: ~1-5ms
- Comparing 10 strategies: ~10-50ms
- Optimization search: ~100-500ms (depending on search range)

All calculations are synchronous and can run in the browser.

## Future Enhancements

Potential additions to the simulation engine:
- Weather effects (wet/dry transitions)
- Traffic and overtaking models
- Safety car periods
- Different tire allocation rules
- Team-specific performance factors
- Driver skill variations
- Track evolution and rubber buildup
