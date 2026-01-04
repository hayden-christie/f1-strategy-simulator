# 🏎️ F1 Strategy Simulator

**Advanced F1 race strategy simulator with realistic tire degradation, fuel effects, and live race tracking**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

> A physics-based F1 race strategy simulator that models tire degradation, fuel effects, pit stop strategies, and real-world racing variables. Built for race engineers, F1 fans, and data enthusiasts.

---

## 🚀 Live Demo

**[View Live Demo →](https://your-vercel-url.vercel.app)**

---

## ✨ Features

### 🔬 **Realistic Physics Simulation**
- **Advanced tire degradation model** with compound-specific behavior
  - U-shaped performance curves (warm-up → sweet spot → degradation)
  - Linear + quadratic degradation components
  - Cliff effects beyond optimal tire life
- **Fuel load effects** - car gets faster as fuel burns off (~0.025s/kg)
- **Pit stop time calculations** - realistic pit lane time loss + stationary time

### 🏁 **Race Modes**
- **Pre-Race Mode**: Predict optimal strategies before the race starts
- **Live Mode**: Track race progress in real-time (2026-ready for live data integration)
- **Post-Race Analysis**: Compare predictions vs actual results with accuracy metrics

### 🎯 **Strategy Optimization**
- Compare multiple pit stop strategies (0-stop to 3-stop)
- Pre-built strategy templates (one-stop, two-stop, aggressive)
- Custom strategy builder
- Side-by-side strategy comparison with visual charts

### 🌍 **Complete F1 Coverage**
- All **24 circuits** from the 2025 F1 season
- Circuit-specific configurations (lap times, pit lane losses)
- Race distance and lap count data

### 🎨 **Interactive Visualizations**
- Lap time progression charts
- Tire degradation graphs
- Stint-by-stint analysis
- Real-time strategy comparison

### ⚙️ **Advanced Options**
- **Driver performance modifiers** - account for driver skill differences
- **Team capabilities** - pit crew speed, car performance
- **Weather conditions** - dry, light rain, heavy rain, mixed
- **Safety car scenarios** - simulate race interruptions
- **Track evolution** - grip improves over race distance

### 🎓 **Beginner-Friendly**
- Interactive tooltips explaining technical terms
- Empty state guidance
- Clear visual indicators
- F1-themed dark UI with premium styling

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[Next.js 15](https://nextjs.org/)** | React framework with App Router |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe development |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling |
| **[Chart.js](https://www.chartjs.org/)** | Interactive visualizations |
| **[FastF1](https://github.com/theOehrly/Fast-F1)** | F1 telemetry data (2026 integration) |
| **[Vercel](https://vercel.com/)** | Deployment and hosting |

---

## 🔬 How It Works

### Physics-Based Simulation Engine

The simulator uses real F1 physics to calculate lap times:

```typescript
lapTime = baseLapTime
        + tireDegradation(compound, age)
        + fuelEffect(fuelLoad)
        + pitStopTime(isPitLap)
```

### Tire Degradation Model

**Three-component degradation system:**

1. **Linear Degradation** - Base wear rate
   - Soft: 0.08% per lap
   - Medium: 0.05% per lap
   - Hard: 0.03% per lap

2. **Quadratic Acceleration** - Degradation accelerates with age
   - Coefficient: 0.10 (balanced for realistic long stints)
   - Creates U-shaped stint pattern

3. **Cliff Effect** - Performance drops after optimal range
   - Soft: optimal 0-20 laps
   - Medium: optimal 0-30 laps
   - Hard: optimal 0-45 laps

### Strategy Optimization

The simulator compares strategies by:
- Running full 57+ lap race simulations
- Calculating total race time (racing + pit stops)
- Analyzing stint-by-stint performance
- Identifying optimal pit stop windows

**Example Output:**
```
Strategy: Two-Stop (Soft → Medium → Soft)
Total Time: 1:28:42.531
Pit Stops: 2 (laps 18, 38)
Average Lap: 89.245s
Delta to Winner: +12.3s
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/hayden-christie/f1-strategy-simulator.git

# Navigate to project directory
cd f1-strategy-simulator

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📊 Project Structure

```
f1-strategy-simulator/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── StrategyBuilder.tsx   # Strategy creation UI
│   ├── ResultsDisplay.tsx    # Simulation results
│   ├── LapTimeChart.tsx      # Visualizations
│   ├── PostRaceAnalysis.tsx  # Post-race comparison
│   └── Tooltip.tsx           # Help tooltips
├── lib/                    # Core simulation engine
│   ├── tireModel.ts          # Tire degradation physics
│   ├── raceSimulator.ts      # Race simulation engine
│   ├── lapTimeCalculator.ts  # Lap time calculations
│   ├── pitStopModel.ts       # Pit stop logic
│   ├── raceData.ts           # 2025 F1 calendar data
│   └── types.ts              # TypeScript definitions
├── public/                 # Static assets
└── styles/                 # Global styles
```

---

## 🎯 Key Algorithms

### Lap Time Calculation

```typescript
function calculateRaceLapTime(
  lapNumber: number,
  tireState: TireState,
  config: RaceConfiguration,
  isPitLap: boolean
): number {
  const fuelLoad = getCurrentFuelLoad(lapNumber, config);
  const lapTime = config.baseLapTime
    + getTireTimePenalty(baseLapTime, tireState)
    + calculateFuelEffect(fuelLoad, config.fuelEffect);

  if (isPitLap) {
    return lapTime + config.pitLaneTimeLoss + config.pitStopStationary;
  }

  return lapTime;
}
```

### Tire Performance

```typescript
function calculateTirePerformance(tireState: TireState): number {
  const compound = TIRE_COMPOUNDS[tireState.compound];

  // Linear degradation
  const linearDeg = compound.degradationRate * tireState.age;

  // Quadratic acceleration (reduced from 0.4 to 0.10 for realism)
  const quadraticDeg = compound.degradationRate * 0.10
    * Math.pow(tireState.age / 15, 2) * tireState.age;

  // Warm-up penalty (first 3 laps)
  const warmUpPenalty = tireState.age < 3
    ? (3 - tireState.age) * 0.0005
    : 0;

  const degradationFactor = 1 + linearDeg + quadraticDeg + warmUpPenalty;

  // Cliff effect beyond optimal range
  const cliffMultiplier = tireState.age > compound.optimalLapRange[1]
    ? 1 + (tireState.age - compound.optimalLapRange[1]) * 0.001
    : 1.0;

  return (1 / compound.baseGripLevel) * degradationFactor * cliffMultiplier;
}
```

---

## 📈 Performance Optimizations

- **Deterministic randomness** - Uses `Math.sin()` instead of `Math.random()` for SSR/hydration consistency
- **Memoized calculations** - Cached tire degradation curves
- **Efficient rendering** - React hooks and optimized re-renders
- **Static generation** - Next.js SSG for race data pages

---

## 🧪 Testing

```bash
# Test tire degradation model
npx tsx debug-pit-stop-math.ts

# Test multiple circuits
npx tsx test-multi-circuit.ts

# Test compound balance
npx tsx test-compound-balance.ts

# Verify demo data
npx tsx test-demo-data.ts
```

**Expected Results:**
- 1-stop vs 3-stop gap: **20-40 seconds** (realistic)
- Tire degradation: **gradual, not exponential**
- Pit stop cost: **22.2 seconds** per stop

---

## 🌟 Screenshots

*Coming soon - Screenshots will be added to showcase:*
- Strategy builder interface
- Lap time progression charts
- Post-race analysis dashboard
- Strategy comparison views

---

## 🔮 Future Enhancements

### Planned Features

- [ ] **2026 Season Integration**
  - Live race data via FastF1 API
  - Real-time telemetry during races
  - Historical race comparisons

- [ ] **Enhanced Analytics**
  - Machine learning for strategy predictions
  - Driver pace analysis
  - Tire stint optimization AI

- [ ] **Social Features**
  - Save and share strategies
  - Community strategy leaderboard
  - Race prediction competitions

- [ ] **Advanced Simulation**
  - DRS (Drag Reduction System) modeling
  - Overtaking probability calculations
  - Race start simulations
  - Virtual Safety Car scenarios

- [ ] **Mobile App**
  - React Native version
  - Live race notifications
  - Quick strategy comparisons

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style (ESLint + Prettier)
- Add tests for new simulation logic
- Update documentation for API changes

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[FastF1](https://github.com/theOehrly/Fast-F1)** - F1 telemetry data library
- **F1 Community** - For feedback and testing
- **Pirelli Motorsport** - Tire compound data and insights
- **Formula 1** - For the incredible sport

---

## 📧 Contact

**Hayden Christie**
- GitHub: [@hayden-christie](https://github.com/hayden-christie)
- Project Link: [https://github.com/hayden-christie/f1-strategy-simulator](https://github.com/hayden-christie/f1-strategy-simulator)

---

## 🏆 Project Highlights

### Technical Achievements

✅ **Realistic Physics** - Validated tire degradation model with real F1 data patterns
✅ **Type-Safe** - 100% TypeScript with comprehensive type definitions
✅ **Performance** - Optimized for fast simulations (57-lap race in <10ms)
✅ **Scalability** - Modular architecture for easy feature additions
✅ **UX Design** - F1-themed interface with beginner-friendly tooltips

### Key Innovations

- **Hybrid degradation model** combining linear + quadratic components
- **Deterministic variation** for SSR consistency (no hydration errors)
- **Multi-mode architecture** supporting pre-race, live, and post-race analysis
- **Circuit-specific tuning** while maintaining global physics accuracy

---

<div align="center">

**Built with ❤️ for F1 fans and race strategy enthusiasts**

[⭐ Star this repo](https://github.com/hayden-christie/f1-strategy-simulator) | [🐛 Report Bug](https://github.com/hayden-christie/f1-strategy-simulator/issues) | [💡 Request Feature](https://github.com/hayden-christie/f1-strategy-simulator/issues)

</div>
