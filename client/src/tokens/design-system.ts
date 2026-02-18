/**
 * Design System Tokens
 * Single source of truth for all design decisions
 */

export const spacing = {
  xs: '0.25rem',  // 4px - tight spacing
  sm: '0.5rem',   // 8px - small spacing
  md: '1rem',     // 16px - standard spacing
  lg: '1.5rem',   // 24px - generous spacing
  xl: '2rem',     // 32px - large spacing
  '2xl': '3rem',  // 48px - extra large
  '3xl': '4rem',  // 64px - section spacing
} as const;

export const typography = {
  // Display/Hero text
  pageTitle: {
    size: '2.5rem',    // 40px
    lineHeight: '1.2',
    weight: 'font-bold',
    letter: 'tracking-tight',
  },
  // Section heading
  sectionTitle: {
    size: '1.875rem',  // 30px
    lineHeight: '1.3',
    weight: 'font-semibold',
    letter: 'tracking-normal',
  },
  // Card/subsection heading
  cardTitle: {
    size: '1.25rem',   // 20px
    lineHeight: '1.4',
    weight: 'font-semibold',
    letter: 'tracking-normal',
  },
  // Body text (default)
  body: {
    size: '1rem',      // 16px
    lineHeight: '1.5',
    weight: 'font-normal',
    letter: 'tracking-normal',
  },
  // Secondary/helper text
  label: {
    size: '0.875rem',  // 14px
    lineHeight: '1.5',
    weight: 'font-medium',
    letter: 'tracking-normal',
  },
  // Small/caption text
  caption: {
    size: '0.75rem',   // 12px
    lineHeight: '1.5',
    weight: 'font-normal',
    letter: 'tracking-normal',
  },
} as const;

export const colors = {
  // Primary - Professional blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  // Accent - Signal/conversion (green for positive outcomes)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    600: '#16a34a',
    700: '#15803d',
  },
  // Status colors
  status: {
    applied: '#3b82f6',    // Blue - neutral
    shortlisted: '#f59e0b', // Amber - promising
    interview: '#8b5cf6',   // Purple - progressing
    selected: '#10b981',    // Green - positive
    rejected: '#ef4444',    // Red - negative
  },
  // Neutral/Gray scale
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.375rem',    // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

// Semantic token mapping
export const semantic = {
  section: {
    spacing: spacing.xl,
    padding: spacing.xl,
  },
  card: {
    spacing: spacing.lg,
    padding: spacing.lg,
    radius: borderRadius.lg,
  },
  input: {
    padding: spacing.md,
    radius: borderRadius.md,
  },
  button: {
    padding: `${spacing.md} ${spacing.lg}`,
    radius: borderRadius.md,
  },
} as const;
