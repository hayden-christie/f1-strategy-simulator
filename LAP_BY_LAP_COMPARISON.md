# Lap-by-Lap Comparison: 1-Stop vs 3-Stop

## Problem Summary

The 3-stop strategy gains **215 seconds** (3.5 minutes!) from fresher tires, which almost completely offsets the 44s lost in pit stops. This makes the 3-stop only 12s slower than the 1-stop - **completely unrealistic**.

---

## The Numbers

### Pit Stop Times (✅ Correct)
- **1-Stop**: 22.2s (1 × 22.2s)
- **3-Stop**: 66.6s (3 × 22.2s)
- **Difference**: +44.4s for 3-stop

### Racing Times (❌ Problem Here)
- **1-Stop**: 5180.9s total, **92.6s average** per lap
- **3-Stop**: 4965.8s total, **92.0s average** per lap
- **Difference**: 3-stop is **215s faster** on track

### Net Result
- 3-stop loses 44.4s in pits
- 3-stop gains 215.1s from fresh tires
- **Net**: Only 12.7s slower

---

## Stint Analysis

### 1-Stop Strategy (Medium → Hard)

**Stint 1 - MEDIUM (28 laps):**
- First lap: 93.066s
- Last lap: 94.443s
- Degradation: **+1.377s** over 28 laps
- Average: 93.317s/lap

**Stint 2 - HARD (28 laps):**
- First lap: 91.869s (fresh HARD after pit)
- Last lap: 92.132s
- Degradation: **+0.262s** over 28 laps
- Average: 91.714s/lap

The HARD compound on stint 2 starts faster than the worn MEDIUM (91.869s vs 94.443s), which is correct. But the MEDIUM degrades 1.4s over 28 laps, which compounds with fuel effects.

### 3-Stop Strategy (Soft → Soft → Soft → Soft)

**Stint 1 - SOFT (13 laps):**
- First lap: 92.885s
- Last lap: 93.265s
- Degradation: **+0.380s** over 13 laps
- Average: 92.978s/lap

**Stint 2 - SOFT (14 laps):**
- First lap: 92.220s
- Last lap: 91.555s
- Degradation: **-0.665s** (faster due to fuel burnoff > tire deg)
- Average: 92.259s/lap

**Stint 3 - SOFT (14 laps):**
- First lap: 91.535s
- Last lap: 90.870s
- Degradation: **-0.665s** (same pattern)
- Average: 91.545s/lap

**Stint 4 - SOFT (13 laps):**
- First lap: 90.850s
- Last lap: 91.449s
- Degradation: **+0.599s** over 13 laps
- Average: 91.063s/lap

---

## Why This Is Unrealistic

### Real F1 Behavior:
1. **Softs don't improve** mid-stint (stints 2-3 show lap times decreasing by 0.665s)
   - This is fuel effect overpowering degradation
   - In reality, even fresh softs degrade from lap 1
2. **1-stop should be competitive** at high-degradation tracks
   - Teams do 1-stops at Bahrain, Spain, Austin
   - They wouldn't if 3-stops were only 12s slower
3. **28-lap stint on MEDIUM** should be viable, not painfully slow
   - Real F1: MEDIUM can do 30-35 laps without falling off a cliff
   - Our model: MEDIUM loses 1.4s over 28 laps (too aggressive)

### Expected Behavior:
- **1-Stop**: ~5200s total (avg 91.2s/lap)
- **3-Stop**: ~5230s total (avg 91.5s/lap)
- **Difference**: 30s (not 12s)

---

## Root Cause: Tire Degradation Model

### Current Model (tireModel.ts)

**Degradation Rates:**
```typescript
SOFT: 0.0008   // ~0.08% per lap
MEDIUM: 0.0005 // ~0.05% per lap
HARD: 0.0003   // ~0.03% per lap
```

**Quadratic Acceleration (line 76):**
```typescript
const quadraticDeg = compound.degradationRate * 0.4 * Math.pow(tireState.age / 15, 2) * tireState.age;
```

This creates **exponential growth** in degradation:
- Lap 10: Minimal quadratic contribution
- Lap 20: Quadratic starts to dominate
- Lap 28: Quadratic overpowers fuel benefit

### Example Calculation (MEDIUM at age 28):

```
baseLapTime = 90s
linearDeg = 0.0005 × 28 = 0.014 (1.4%)
quadraticDeg = 0.0005 × 0.4 × (28/15)² × 28 = 0.0005 × 0.4 × 3.48 × 28 = 0.0195 (1.95%)
Total deg = 1.4% + 1.95% = 3.35%
Time penalty = 90 × 0.0335 = 3.015s

Plus compound offset (MEDIUM = +0.18s) and fuel effect
Result: Lap 28 is ~94s (vs 93s on lap 1)
```

The quadratic term adds **1.95% degradation** on top of the linear 1.4%, making old tires far too slow.

---

## Solution

### Option 1: Reduce Quadratic Coefficient
Change line 76 from `0.4` to `0.15`:
```typescript
const quadraticDeg = compound.degradationRate * 0.15 * Math.pow(tireState.age / 15, 2) * tireState.age;
```

This would reduce the runaway degradation on long stints.

### Option 2: Cap Degradation
Add a maximum degradation cap:
```typescript
const totalDeg = Math.min(0.05, linearDeg + quadraticDeg + warmUpPenalty); // Cap at 5%
```

This prevents tires from becoming unrealistically slow.

### Option 3: Adjust Degradation Rates
Reduce base degradation rates:
```typescript
SOFT: 0.0006   // Down from 0.0008
MEDIUM: 0.0004 // Down from 0.0005
HARD: 0.0002   // Down from 0.0003
```

This makes all compounds more durable.

---

## Recommendation

**Use a combination:**
1. Reduce quadratic coefficient to `0.2` (from 0.4)
2. Reduce MEDIUM degradation rate to `0.00045` (from 0.0005)
3. Keep SOFT and HARD rates the same

This would:
- Make 1-stop strategies more competitive (30s faster)
- Reduce the 3-stop's time gain to ~20s (from 215s)
- Result in realistic 30-second gap between 1-stop and 3-stop
- Preserve the U-shaped stint pattern (warm-up + degradation)

Expected result after fix:
- **1-Stop**: ~5200s (winner)
- **3-Stop**: ~5230s (+30s slower, realistic)
