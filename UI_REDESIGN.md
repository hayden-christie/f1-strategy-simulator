# 🎨 UI Redesign - Design System & Layout Overhaul

## Branch: `ui-redesign`

This branch contains a complete UI redesign of the F1 Strategy Simulator with a new color scheme, sidebar-based layout, and improved user experience.

---

## 🎯 Design Goals

1. **Professional Racing Aesthetic** - Dark blue-gray backgrounds with racing red/teal accents
2. **Better Information Architecture** - Contextual sidebars for mode-specific content
3. **Improved Strategy Builder** - Hybrid timeline + list view for better visualization
4. **Responsive Design** - Sidebars collapse gracefully on mobile devices
5. **Consistent Design System** - Centralized color tokens and spacing variables

---

## 🎨 New Color Scheme

### Background Colors
```typescript
bg: {
  main: '#0f1419',        // Main background - dark blue-gray
  sidebar: '#1a1f2e',     // Sidebar background - lighter blue-gray
  card: '#1e2433',        // Elevated card background
  input: '#252d3d',       // Input field background
  elevated: '#2a3441',    // Elevated elements
}
```

### Text Colors
```typescript
text: {
  primary: '#e8edf4',     // Primary text - off-white
  secondary: '#9ba3b0',   // Secondary text - gray
  muted: '#6b7280',       // Muted text - darker gray
  inverse: '#0f1419',     // Inverse text for colored backgrounds
}
```

### Accent Colors
```typescript
accent: {
  red: '#e8384f',         // Racing red - primary CTA
  teal: '#14b8a6',        // Teal - success, optimal
  purple: '#8b5cf6',      // Purple - analysis
  blue: '#3b82f6',        // Blue - info
  green: '#10b981',       // Green - positive
  yellow: '#fbbf24',      // Yellow - warning
}
```

### Tire Compound Colors
```typescript
tire: {
  soft: '#ff4757',        // Soft - Red
  medium: '#ffd93d',      // Medium - Yellow
  hard: '#f0f0f0',        // Hard - White
  intermediate: '#10b981', // Intermediate - Green
  wet: '#3b82f6',         // Wet - Blue
}
```

### Mode-Specific Colors
```typescript
mode: {
  preRace: '#3b82f6',     // Pre-Race - Blue
  live: '#e8384f',        // Live - Red
  postRace: '#8b5cf6',    // Post-Race - Purple
}
```

---

## 🏗️ New Layout Structure

### Left Sidebar (280px open, 64px collapsed)

**Contains:**
- App logo/title
- Race selection dropdown
- Mode tabs (Pre-Race, Live, Post-Race)
- Saved predictions list (scrollable)
- Settings button

**Collapsible:**
- Toggle button positioned at `-right-3` (overlaps main content slightly)
- Icons remain visible when collapsed
- Smooth 300ms transition

**Styling:**
```typescript
width: isOpen ? '280px' : '64px'
backgroundColor: colors.bg.sidebar
borderRight: `1px solid ${colors.border.default}`
```

### Right Sidebar (320px, toggleable)

**Contains mode-specific content:**

**Pre-Race Mode:**
- Circuit information (lap count, avg lap time, pit loss)
- Optimal strategy suggestions
- Strategy tips

**Live Mode:**
- "Coming in 2026" message
- Live race data placeholder

**Post-Race Mode:**
- Available metrics list
- Analysis tools
- FastF1 integration info

**Styling:**
```typescript
width: '320px'
backgroundColor: colors.bg.sidebar
borderLeft: `1px solid ${colors.border.default}`
```

### Main Content Area

**Dynamic width based on sidebar states:**
```typescript
marginLeft: leftSidebarOpen ? '280px' : '64px'
marginRight: rightSidebarOpen ? '320px' : '0px'
```

**Top Bar (Sticky):**
- Breadcrumb navigation (Mode / Race Name)
- Quick action buttons (Run Simulation, Save Prediction)
- Background: `colors.bg.sidebar`
- Box shadow for depth

**Content:**
- Max width: 900px (centered)
- Padding: 6 (24px)
- Strategy builder and results

---

## 🏎️ Hybrid Timeline Strategy Builder

### Timeline View (Top Section)

**Visual Elements:**
- Race progress bar (height: 48px)
- Colored tire stint segments
- Pit stop markers (red "P" indicators)
- Hover tooltips showing lap ranges and compounds

**Tire Segments:**
- Width calculated as percentage of total laps
- Background color matches tire compound
- Border-right between segments (2px, card background color)
- Label shows tire letter (S, M, H)

**Pit Stop Markers:**
- Position calculated as percentage: `(stop.lap / totalLaps) * 100`
- Red background (`colors.accent.red`)
- White "P" text
- Hover tooltip shows pit stop number and lap
- Scale animation on hover (1.1x)

**Lap Markers:**
- Shows Lap 1, middle lap, and final lap
- Text color: `colors.text.secondary`
- Font size: xs (12px)

### List View (Bottom Section)

**Starting Compound Card:**
- Current compound displayed
- Three tire buttons (S, M, H)
- Active button shows tire color
- Inactive buttons show sidebar background

**Pit Stop Cards:**
- Lap number input (type: number, min: 1, max: totalLaps)
- Three tire compound buttons
- Remove button (red X icon, hover scale 1.1x)
- Grid layout: 2 columns (lap, tires), remove button on right

**Empty State:**
- Dashed border
- Center-aligned text
- Prompt to add pit stops

**Add Pit Stop Button:**
- Teal background (`colors.accent.teal`)
- Positioned in header next to title
- Adds stop 15 laps after last pit (or lap 15 if first)
- Auto-sorts pit stops by lap number

---

## 📁 New Files Created

### `lib/designSystem.ts`
**Purpose:** Centralized design tokens

**Exports:**
- `colors` - Complete color palette
- `spacing` - Sidebar widths, border radius, shadows
- `transitions` - Animation durations

**Usage:**
```typescript
import { colors, spacing } from '@/lib/designSystem';

<div style={{ backgroundColor: colors.bg.card }}>
```

### `components/LeftSidebar.tsx`
**Purpose:** Collapsible left sidebar with race/mode selection

**Props:**
- `isOpen: boolean` - Sidebar open state
- `onToggle: () => void` - Toggle callback
- `currentMode: RaceMode` - Current race mode
- `onModeChange: (mode: RaceMode) => void` - Mode change callback
- `selectedRace: string | null` - Current race name
- `savedPredictions: any[]` - List of saved predictions

**Key Features:**
- Smooth collapse animation
- Icons visible when collapsed
- Mode tabs with emoji icons
- Saved predictions scrollable list

### `components/RightSidebar.tsx`
**Purpose:** Contextual sidebar showing mode-specific content

**Props:**
- `isOpen: boolean` - Sidebar open state
- `onToggle: () => void` - Toggle callback
- `currentMode: RaceMode` - Current race mode
- `selectedRace: string | null` - Current race name

**Key Features:**
- Different content per mode
- Circuit info cards
- Optimal strategy suggestions
- Coming soon messages for Live/Post-Race

### `components/TimelineStrategyBuilder.tsx`
**Purpose:** Hybrid timeline + list view for strategy building

**Props:**
- `strategy: Strategy` - Current strategy
- `totalLaps: number` - Total race laps
- `onUpdateStrategy: (strategy: Strategy) => void` - Update callback

**Key Features:**
- Visual timeline with tire segments
- Draggable pit stop markers
- Detailed list view
- Both views stay in sync
- Add/remove pit stops
- Tire compound selectors

### `components/ResponsiveLayout.tsx`
**Purpose:** Wrapper component handling responsive sidebar behavior

**Props:**
- `children: ReactNode` - Main content
- `raceMode: RaceMode` - Current mode
- `onModeChange: (mode: RaceMode) => void` - Mode change
- `selectedRace: string | null` - Current race
- `savedPredictions: RacePrediction[]` - Predictions list
- `breadcrumb?: string` - Breadcrumb text
- `quickActions?: ReactNode` - Top bar actions

**Key Features:**
- Manages sidebar states
- Calculates dynamic margins
- Sticky top bar
- Mobile responsive (sidebars hidden on mobile)

### `app/page-redesign.tsx`
**Purpose:** New main page using redesigned layout

**Key Changes from Original:**
- Single strategy instead of multi-strategy comparison
- Integrated with new sidebars
- Uses TimelineStrategyBuilder
- Simplified workflow
- Max width 900px for content

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- Left sidebar: 280px open, 64px collapsed
- Right sidebar: 320px open, 0px closed
- Main content: Dynamic width with max 900px
- All features fully visible

### Tablet (768px - 1024px)
- Left sidebar: 280px open, 64px collapsed
- Right sidebar: 320px open (may overlay content)
- Main content: Dynamic width
- Reduced padding

### Mobile (< 768px)
- Sidebars: Overlay mode (not affecting main content margin)
- Main content: Full width (margin-left: 0, margin-right: 0)
- Sidebars slide in from left/right
- Close button more prominent
- Reduced padding throughout

---

## 🎨 Design Patterns

### Segmented Controls
Used for mode selection in left sidebar:
- Minimal spacing (gap-0.5 = 2px)
- Rounded corners only on outer edges
- Active state shows mode color + 20% opacity background
- Border matches mode color when active

### Cards
All content cards follow consistent styling:
```typescript
backgroundColor: colors.bg.card
border: `1px solid ${colors.border.default}`
borderRadius: '8px'
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
```

### Buttons
Three button styles:

**Primary (Red):**
```typescript
backgroundColor: colors.accent.red
color: 'white'
hover: scale(1.05)
```

**Secondary (Teal):**
```typescript
backgroundColor: colors.accent.teal
color: 'white'
hover: scale(1.05)
```

**Tertiary (Transparent):**
```typescript
backgroundColor: 'transparent'
border: `1px solid ${colors.border.default}`
color: colors.text.secondary
hover: backgroundColor: colors.bg.input
```

### Inputs
```typescript
backgroundColor: colors.bg.sidebar
border: `1px solid ${colors.border.default}`
color: colors.text.primary
borderRadius: '6px'
```

### Tooltips
```typescript
backgroundColor: colors.bg.sidebar
border: `1px solid ${colors.border.default}`
color: colors.text.primary
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
opacity: 0 (default), 1 (on hover)
transition: opacity 200ms
```

---

## 🚀 Benefits of New Design

### ✅ Better Information Architecture
- Mode-specific content in right sidebar
- Race/strategy controls in left sidebar
- Main area focused on strategy building
- Clear visual hierarchy

### ✅ Improved Strategy Visualization
- Timeline shows race progression at a glance
- Pit stops visually positioned on timeline
- Tire compounds color-coded
- Both high-level and detailed views available

### ✅ Professional Appearance
- Consistent color scheme throughout
- Racing-inspired aesthetic
- Smooth transitions and animations
- Proper depth with shadows

### ✅ Responsive Design
- Works on desktop, tablet, and mobile
- Sidebars collapse gracefully
- Content remains accessible
- No horizontal scrolling

### ✅ Scalability
- Design system can be extended
- New modes easily added
- Components reusable
- Centralized styling

---

## 🔧 How to Use

### Switch to UI Redesign Branch
```bash
git checkout ui-redesign
```

### Run Development Server
```bash
npm run dev
```

### View Redesigned Page
The new page is available at:
- Original: `/` (app/page.tsx)
- Redesign: `/redesign` (app/page-redesign.tsx)

To make the redesign the default, replace `app/page.tsx` with `app/page-redesign.tsx`.

---

## 📝 Migration Path

### To Deploy UI Redesign:

**Option 1: Replace Existing Page**
```bash
# Backup original
cp app/page.tsx app/page-original.tsx

# Replace with redesign
cp app/page-redesign.tsx app/page.tsx

# Commit
git add .
git commit -m "Deploy UI redesign as main page"
```

**Option 2: Gradual Rollout**
1. Keep both pages available
2. Add route switcher in header
3. Gather user feedback
4. Switch default after testing

**Option 3: A/B Testing**
1. Use feature flag to toggle between layouts
2. Track user engagement metrics
3. Roll out to 50% of users
4. Full rollout after validation

---

## 🎯 Future Enhancements

### Phase 1: Core Features
- [ ] Draggable pit stop markers on timeline
- [ ] Zoom in/out on timeline
- [ ] Multi-strategy comparison in redesign
- [ ] Driver selection in left sidebar

### Phase 2: Advanced Features
- [ ] Custom color themes (light mode, team colors)
- [ ] Save sidebar preferences to localStorage
- [ ] Keyboard shortcuts for common actions
- [ ] Advanced pit stop editor with stint details

### Phase 3: Mobile Optimization
- [ ] Bottom sheet for mobile sidebar
- [ ] Swipe gestures to open/close sidebars
- [ ] Simplified timeline for small screens
- [ ] Touch-friendly controls

### Phase 4: Accessibility
- [ ] High contrast mode
- [ ] Screen reader optimization
- [ ] Keyboard navigation
- [ ] Focus indicators

---

## 🐛 Known Issues

### Current Limitations
1. **Mobile**: Sidebars overlay content instead of proper sheet
2. **Timeline**: Pit markers not draggable yet (requires additional logic)
3. **Multi-Strategy**: Redesign currently supports single strategy only
4. **Race Selection**: Dropdown in left sidebar not yet implemented (placeholder)

### To Be Fixed
- [ ] Add proper race selector dropdown in left sidebar
- [ ] Implement mobile bottom sheet for sidebars
- [ ] Add pit marker drag-and-drop on timeline
- [ ] Support multi-strategy comparison in new layout
- [ ] Add driver selector in left sidebar

---

## 📊 Comparison: Old vs New

### Old Design
- Single-page layout with vertical sections
- Grid-based strategy comparison (up to 3)
- Race/driver selection at top
- Mode selector as card
- Results below strategy builder
- Gray backgrounds (#141414, #1f1f1f)
- Racing red accent (#dc0000)

### New Design
- Sidebar-based layout (left + right)
- Single strategy focus with timeline view
- Race selection in left sidebar
- Mode tabs in left sidebar
- Results below timeline
- Blue-gray backgrounds (#0f1419, #1a1f2e)
- Racing red (#e8384f) + teal (#14b8a6) accents

### Migration Impact
- **Breaking**: Multi-strategy comparison removed in redesign
- **New**: Timeline visualization
- **New**: Contextual right sidebar
- **Changed**: Navigation pattern (sidebars vs top cards)
- **Improved**: Visual hierarchy and information architecture

---

## 🎓 Technical Details

### State Management
```typescript
// Sidebar states
const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

// Dynamic margins
const getMainMargin = () => ({
  marginLeft: leftSidebarOpen ? '280px' : '64px',
  marginRight: rightSidebarOpen ? '320px' : '0px',
});
```

### Timeline Calculation
```typescript
// Calculate stint segments
const getStintSegments = () => {
  const segments = [];
  let currentLap = 1;

  // First stint
  const firstStintEnd = pitStops.length > 0 ? pitStops[0].lap - 1 : totalLaps;
  segments.push({
    start: currentLap,
    end: firstStintEnd,
    compound: startingCompound,
    width: ((firstStintEnd - currentLap + 1) / totalLaps) * 100,
  });

  // Remaining stints
  pitStops.forEach((stop, index) => {
    currentLap = stop.lap + 1;
    const nextStop = pitStops[index + 1];
    const stintEnd = nextStop ? nextStop.lap - 1 : totalLaps;

    segments.push({
      start: currentLap,
      end: stintEnd,
      compound: stop.tireCompound,
      width: ((stintEnd - currentLap + 1) / totalLaps) * 100,
    });
  });

  return segments;
};
```

### Pit Stop Positioning
```typescript
const position = (stop.lap / totalLaps) * 100;

<div
  className="absolute top-0 -translate-x-1/2"
  style={{ left: `${position}%` }}
>
  {/* Pit marker */}
</div>
```

---

## 📚 References

### Inspiration
- F1 TV Pro interface
- iRacing telemetry dashboard
- iOS/macOS segmented controls
- Material Design navigation drawer

### Technologies
- Next.js 15 App Router
- TypeScript
- Tailwind CSS (utility classes)
- Inline styles for design system colors
- CSS transitions for animations

---

## ✅ Testing Checklist

Before merging to main:

**Visual:**
- [ ] Left sidebar opens/closes smoothly
- [ ] Right sidebar opens/closes smoothly
- [ ] Timeline shows correct tire segments
- [ ] Pit markers positioned correctly
- [ ] Colors match design system
- [ ] Shadows render properly
- [ ] Hover states work on all interactive elements

**Functional:**
- [ ] Can add pit stops
- [ ] Can remove pit stops
- [ ] Can change tire compounds
- [ ] Can change starting compound
- [ ] Pit stops auto-sort by lap
- [ ] Simulation runs correctly
- [ ] Save prediction works
- [ ] Mode switching updates right sidebar

**Responsive:**
- [ ] Desktop (1920px+) - all features visible
- [ ] Laptop (1440px) - sidebars don't overlap
- [ ] Tablet (768px) - content readable
- [ ] Mobile (375px) - sidebars hidden, content full-width

**Accessibility:**
- [ ] All buttons have aria-labels
- [ ] Tooltips don't block clicks
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA

---

## 🎉 Summary

The UI redesign introduces:
- ✅ New dark blue-gray color scheme with racing accents
- ✅ Collapsible left sidebar (280px/64px) with race/mode selection
- ✅ Contextual right sidebar (320px) with mode-specific content
- ✅ Hybrid timeline + list strategy builder
- ✅ Responsive design with mobile support
- ✅ Centralized design system with reusable tokens
- ✅ Professional racing aesthetic

This redesign improves information architecture, visual hierarchy, and user experience while maintaining all core functionality of the simulator.
