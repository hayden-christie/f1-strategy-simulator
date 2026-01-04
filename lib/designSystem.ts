/**
 * F1 Strategy Simulator - Design System
 * Color scheme and design tokens for the UI redesign
 */

export const colors = {
  // Backgrounds
  bg: {
    main: '#0f1419',        // Main background - dark blue-gray
    sidebar: '#1a1f2e',     // Sidebar background - lighter blue-gray
    card: '#1e2433',        // Elevated card background
    input: '#252d3d',       // Input field background
    elevated: '#2a3441',    // Elevated elements
  },

  // Borders
  border: {
    default: '#2a3441',
    light: '#3a4451',
    focus: '#14b8a6',
  },

  // Text
  text: {
    primary: '#e8edf4',
    secondary: '#9ba3b0',
    muted: '#6b7280',
    inverse: '#0f1419',
  },

  // Brand & Accents
  accent: {
    red: '#e8384f',         // Racing red
    teal: '#14b8a6',        // Teal accent
    purple: '#8b5cf6',      // Purple accent
    blue: '#3b82f6',        // Blue accent
    green: '#10b981',       // Success green
    yellow: '#fbbf24',      // Warning yellow
  },

  // Tire Compounds
  tire: {
    soft: '#ff4757',        // Soft - Red
    medium: '#ffd93d',      // Medium - Yellow
    hard: '#f0f0f0',        // Hard - White
    intermediate: '#10b981', // Intermediate - Green
    wet: '#3b82f6',         // Wet - Blue
  },

  // Race Modes
  mode: {
    preRace: '#3b82f6',     // Blue
    live: '#10b981',        // Green
    postRace: '#8b5cf6',    // Purple
  },
} as const;

export const spacing = {
  sidebar: {
    open: '280px',
    collapsed: '64px',
    right: '320px',
  },
  borderRadius: {
    card: '8px',
    button: '6px',
    sm: '4px',
  },
  shadow: {
    card: '0 4px 12px rgba(0, 0, 0, 0.4)',
    hover: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;
