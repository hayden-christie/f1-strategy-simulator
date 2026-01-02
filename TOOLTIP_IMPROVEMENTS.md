# Tooltip & Help Text Improvements

## Overview
Added comprehensive tooltips and help text throughout the F1 Strategy Simulator to make it beginner-friendly for F1 fans who aren't familiar with strategy simulation.

## New Components

### `components/Tooltip.tsx`
- **Reusable Tooltip Component**: Dark-themed info tooltips with F1 tech aesthetic
- **InfoLabel Component**: Combines label text with info icon (ⓘ) and tooltip
- Features:
  - Appears on hover with smooth transitions
  - Dark gray background (#141414) with border
  - **Intelligent positioning**: Automatically appears above or below based on screen space
  - **Proper text wrapping**: Fixed width (200-280px) with multi-line support
  - **Overflow prevention**: Never goes off-screen edges
  - **Improved readability**: `leading-relaxed` line height for better text flow
  - Larger arrow indicators (6px) for better visual connection
  - Concise explanations (1-2 sentences max)

## Components Updated

### 1. StrategyBuilder.tsx
**Tooltips Added:**
- **Starting Tire Label**: "Choose your opening compound: Soft (fastest, wears quickly), Medium (balanced), Hard (slowest, most durable)"
- **SOFT Tire**: "Fastest compound but degrades quickly (~0.05-0.08s/lap). Best for qualifying or short stints."
- **MEDIUM Tire**: "Balanced compound with moderate speed and degradation (~0.03-0.05s/lap). Versatile choice."
- **HARD Tire**: "Most durable compound but slowest (~0.02-0.03s/lap). Best for long stints."
- **Strategy Preview**: "Summary of your race strategy including total laps and tire stint breakdown"

**Help Text Improved:**
- Empty state: "Add pit stops to create your race strategy. Plan when to change tires during the race."

---

### 2. ResultsDisplay.tsx
**Tooltips Added:**
- **Average Lap**: "Average lap time across the entire race (excluding pit stops)"
- **Avg Lap (Stint)**: "Average lap time for this stint (lower is faster)"

**Empty State Improved:**
- Added chart icon visual
- "No simulation results yet"
- "Build a strategy and run simulation to see results"
- "Results will show total race time, lap times, pit stops, and tire strategy analysis"

---

### 3. StrategyComparison.tsx
**Tooltips Added:**
- **TOTAL DEG**: "Total time lost to tire degradation over this stint (first lap to last lap)"
- **DEG RATE**: "Tire degradation rate: average time lost per lap due to tire wear"

---

### 4. AdvancedConfig.tsx
**Tooltips Added:**
- **Advanced Configuration**: "Optional race conditions: fuel effect, weather changes, safety cars, tire degradation, and track evolution"
- **Enhanced Fuel Effect**: "Cars get faster as fuel burns off during the race (~0.03s per lap improvement)"

**Help Text Improved:**
- Enhanced Fuel Effect subtitle: "Lighter car = faster lap times"

---

### 5. ModeSelector.tsx
**Tooltips Added:**
- **Pre-Race Mode**: "Run simulations before the race to predict optimal strategies"
- **Post-Race Mode**: "Compare your predictions to actual race results and analyze accuracy"

---

### 6. RaceSelector.tsx
**Help Text Improved:**
- Empty state: "Select a race to begin..." (clearer instruction)

---

## Key Terminology Explained

### Tire Degradation Terms
| Term | Meaning | User-Friendly Explanation |
|------|---------|---------------------------|
| **DEG** | Degradation | Tire wear - how much slower your car gets as tires age |
| **DEG RATE** | Degradation Rate | Seconds lost per lap due to tire wear |
| **TOTAL DEG** | Total Degradation | Total time lost from fresh tires to worn tires |
| **AVG LAP** | Average Lap Time | Average time per lap in a stint or race |

### Tire Compounds
| Compound | Speed | Durability | Degradation Rate | Best Use |
|----------|-------|------------|------------------|----------|
| **SOFT** | Fastest | Lowest | ~0.05-0.08s/lap | Qualifying, short stints |
| **MEDIUM** | Balanced | Moderate | ~0.03-0.05s/lap | Versatile, medium stints |
| **HARD** | Slowest | Highest | ~0.02-0.03s/lap | Long stints, one-stop races |

### Race Modes
| Mode | Purpose | When to Use |
|------|---------|-------------|
| **Pre-Race** | Strategy prediction | Before race starts - simulate optimal strategies |
| **Live** | Real-time tracking | During race - compare predictions to live data |
| **Post-Race** | Results analysis | After race - evaluate prediction accuracy |

---

## User Experience Improvements

### Empty States
1. **No Simulation Results**: Clear visual icon + 3-tier messaging (main, action, detail)
2. **No Pit Stops**: Helpful guidance on what to do next
3. **No Race Selected**: Clear prompt to start

### Beginner-Friendly Features
- Info icons (ⓘ) appear next to technical terms
- Hover for explanations (no clicking required)
- Concise tooltips (1-2 sentences)
- Speed vs durability tradeoffs explained
- Technical metrics explained in plain language

### F1 Tech Aesthetic
- Dark tooltips matching overall theme
- Monospace font for technical data
- Teal/red accent colors matching F1 branding
- Smooth hover transitions

---

## Technical Implementation

### Tooltip Component Structure
```tsx
<Tooltip text="Explanation here">
  <button>Element with tooltip</button>
</Tooltip>

// Or use InfoLabel for labels
<InfoLabel
  label="Term"
  tooltip="Explanation"
/>
```

### Styling
- Background: `bg-gray-900` (#111827)
- Border: `border-gray-700` (#374151)
- Text: `text-gray-100` (#f3f4f6)
- Width: 200px - 280px (fixed, with text wrapping)
- Line height: `leading-relaxed` (1.625)
- Padding: 12px horizontal, 8px vertical
- Positioning: Intelligent (top or bottom based on screen space)
- z-index: 50 (appears above all content)
- Arrow size: 6px borders (larger and more visible)

---

## Build Status
✅ **Build Successful** - All tooltips integrated without errors
✅ **TypeScript Types** - Proper typing for all tire compounds
✅ **Accessibility** - Info icons use `cursor: help` pointer
✅ **Text Overflow Fixed** - Proper wrapping with 200-280px width
✅ **Smart Positioning** - Tooltips adjust based on screen space
✅ **No Overflow** - Never extends beyond screen boundaries

---

## Files Modified
1. ✅ `components/Tooltip.tsx` (NEW)
2. ✅ `components/StrategyBuilder.tsx`
3. ✅ `components/ResultsDisplay.tsx`
4. ✅ `components/StrategyComparison.tsx`
5. ✅ `components/AdvancedConfig.tsx`
6. ✅ `components/ModeSelector.tsx`
7. ✅ `components/RaceSelector.tsx`

---

## Next Steps (Optional)
- Add tooltips to LapTimeChart component
- Add tooltips to PostRaceAnalysis component
- Consider adding a "Help" modal with full glossary
- Add keyboard shortcut (?) to show all tooltips

---

## Tooltip Overflow Fixes

### Problem
Initial tooltips had text overflow issues:
- Long text ran outside tooltip boxes
- `whitespace-nowrap` prevented text wrapping
- No max-width constraint
- Could extend beyond screen edges

### Solution Implemented

#### 1. Width Constraints
```tsx
style={{
  maxWidth: '280px',
  minWidth: '200px',
}}
className="w-64"  // 256px default width
```

#### 2. Text Wrapping
```tsx
className="whitespace-normal leading-relaxed"
// Changed from: whitespace-nowrap
// Added: leading-relaxed for better readability
```

#### 3. Intelligent Positioning
```tsx
// Automatically detects available space
const tooltipRect = tooltipRef.current.getBoundingClientRect();
const triggerRect = triggerRef.current.getBoundingClientRect();

if (triggerRect.top - tooltipRect.height < 10) {
  setPosition('bottom');  // Show below if no space above
} else {
  setPosition('top');     // Show above by default
}
```

#### 4. Improved Visual Design
- Larger arrow indicators (4px → 6px)
- Better padding (px-3 py-2)
- Relaxed line height for multi-line text
- Centered positioning with horizontal constraints

### Result
✅ All tooltips now properly wrap text
✅ No text overflow or cutoff
✅ Intelligent positioning prevents off-screen rendering
✅ Consistent width for better readability
✅ Better line spacing for multi-line tooltips

---

## Summary
The app is now self-explanatory for F1 fans who aren't familiar with strategy simulation. Every technical term has a tooltip, empty states provide clear guidance, and the tire compound tradeoffs are explained in beginner-friendly language. All tooltips properly wrap text and intelligently position themselves to stay on screen.
