# Tire Degradation Model - Final Fix (V2)

## Problem
Even after the initial fix, tire degradation was still too aggressive. Lap times were degrading by 5-6 seconds per stint instead of the realistic 0.5-2 seconds.

**Issue**: The degradation rates weren't accounting for **fuel burn-off** balancing tire wear.

## Real F1 Physics

### The Balance
In real F1 racing, two opposing forces balance each other:

1. **Tire Degradation** (slows you down): ~0.03-0.05s per lap
2. **Fuel Burn-Off** (speeds you up): ~0.03s per lap as car gets lighter

**Net Result**: Lap times stay relatively flat (within 0.5-2s) across a stint!

### Realistic Stint Pattern
Example 20-lap stint on Medium tires:
- **Laps 1-3**: Best times (1:32.0) - tires at optimal temp
- **Laps 4-15**: Consistent pace (1:32.2-1:32.5) - fuel compensates for tire deg
- **Laps 16-20**: Gradual slowdown (1:32.8-1:33.2) - degradation starts winning
- **Total spread**: ~1.2 seconds over 20 laps

## Final Solution

### 1. Drastically Reduced Base Degradation Rates
**Location**: `lib/tireModel.ts` lines 19-39

**Before (V1 - Still too high)**:
- SOFT: 0.004 (0.4% per lap)
- MEDIUM: 0.0025 (0.25% per lap)
- HARD: 0.0015 (0.15% per lap)

**After (V2 - Realistic)**:
- SOFT: **0.0005** (0.05% per lap → ~0.045s/lap at 90s base)
- MEDIUM: **0.0003** (0.03% per lap → ~0.027s/lap)
- HARD: **0.0002** (0.02% per lap → ~0.018s/lap)

### 2. Added Subtle Non-Linear Acceleration
**Location**: `lib/tireModel.ts` lines 66-75

Now degradation has TWO components:

```typescript
// Linear component: consistent wear
const linearDeg = compound.degradationRate * tireState.age;

// Quadratic component: acceleration in final laps
const quadraticDeg = compound.degradationRate * 0.15 * Math.pow(tireState.age / 20, 2) * tireState.age;

const degradationFactor = 1 + linearDeg + quadraticDeg;
```

This creates the realistic pattern:
- **Early stint**: Mostly linear degradation
- **Mid stint**: Still balanced by fuel
- **Final 5-10 laps**: Degradation accelerates slightly

### 3. Reduced Cliff Effect
**Location**: `lib/tireModel.ts` line 85

**Before**: 1.5% penalty per lap over optimal range (too harsh)
**After**: **0.3% penalty** per lap over optimal range

```typescript
// Teams can extend stints 5-10 laps past optimal with gradual falloff
cliffMultiplier = 1 + (lapsOverLimit * 0.003);
```

## Results - Bahrain Grand Prix

### One-Stop Strategy (Soft → Hard, Pit Lap 28)

#### First Stint (Soft, 27 laps):
```
Lap  1: 1:32.750 (heavy fuel, fresh tires)
Lap 10: 1:32.740 (fuel compensating perfectly!)
Lap 20: 1:32.818 (still consistent)
Lap 27: 1:34.024 (slight degradation showing)
```
**Consistency**: Lap times vary by only **1.3s over 27 laps**! ✓

#### Second Stint (Hard, 29 laps):
```
Lap 35: 1:31.606 (fresh tires, light fuel)
Lap 45: 1:31.338 (maintaining pace)
Lap 57: 1:31.106 (fastest lap - minimal fuel)
```
**Consistency**: Lap times vary by only **0.5s over 29 laps**! ✓

### Long First Stint (Soft, 34 laps):
```
Lap  1: 1:32.750
Lap 11: 1:32.742 (perfectly balanced!)
Lap 21: 1:32.835 (still within 0.1s)
Lap 26: 1:34.322 (gradual slowdown starts)
Lap 31: 1:35.885 (worn tires showing)
Lap 34: 1:36.866 (end of extended stint)
```
**Spread**: 4.1s over 34 laps (realistic for extended stint) ✓

### Overall Race Metrics:
- ✅ **Total race time**: 1:27:59 for 57 laps
- ✅ **Average lap**: 1:32.179
- ✅ **Fastest lap**: 1:31.106 (end of race, light fuel)
- ✅ **Lap time spread within stint**: 0.5-2s (realistic!)

## The Physics Explained

### Lap 1 (Fresh tires, 110kg fuel):
- Base: 90.0s
- Tire penalty: 0s (fresh)
- Fuel penalty: +2.75s
- **Total: 92.75s (1:32.750)**

### Lap 10 (9-lap old tires, ~93kg fuel):
- Base: 90.0s
- Tire penalty: +0.41s (small degradation)
- Fuel penalty: +2.33s (lighter by 0.42s)
- **Total: 92.74s (1:32.740)** ← Nearly identical to lap 1!

### Lap 20 (19-lap old tires, ~74kg fuel):
- Base: 90.0s
- Tire penalty: +0.90s
- Fuel penalty: +1.85s (lighter by 0.90s)
- **Total: 92.82s (1:32.818)** ← Still within 0.1s!

**This is the magic**: Fuel effect (-0.03s/lap) perfectly balances tire deg (+0.045s/lap)!

## Comparison: Before vs After

### Before V2 (Over-degraded):
```
Lap  1: 1:32.750
Lap 10: 1:35.563 (+2.8s already!)
Lap 20: 1:38.688 (+5.9s total)
```
**Problem**: Degradation overwhelming fuel benefit

### After V2 (Realistic):
```
Lap  1: 1:32.750
Lap 10: 1:32.740 (+0.0s - perfect balance!)
Lap 20: 1:32.818 (+0.1s - still balanced)
```
**Success**: Fuel and tire effects perfectly balanced!

## Files Modified

1. **lib/tireModel.ts**
   - Reduced degradationRate by ~87% (0.004 → 0.0005 for Soft)
   - Added quadratic component for gradual acceleration
   - Reduced cliff penalty from 1.5% to 0.3% per lap

## Key Takeaways

✅ **Fuel burn-off is critical** - Must be modeled alongside tire degradation
✅ **Degradation rates must be tiny** - ~0.05% per lap, not 0.4%
✅ **Non-linear acceleration** - Adds realism in final laps without being dramatic
✅ **Cliff effect is subtle** - Teams can extend stints 5-10 laps with gradual falloff

The simulator now accurately represents F1 strategy decisions where:
- Stint length is flexible (can push tires 5-10 laps past optimal)
- Lap times stay consistent (drivers can maintain pace)
- Strategy differences come from pit stop timing, not crazy degradation
