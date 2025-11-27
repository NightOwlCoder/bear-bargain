/**
 * 🐻 BearBargain Design Tokens
 * Colors from docs/DesignLanguage.md
 */

export const COLORS = {
  // Primary Bear Theme
  bearPrimary: '#1A5C38',    // Forest green - BUY buttons
  bearSecondary: '#8B4513',  // Brown - DIP alerts
  gold: '#D4AF37',           // Accent - PROFIT explosions
  
  // Semantic Colors
  gainGreen: '#00C853',      // Profits
  lossRed: '#FF5252',        // Losses
  warningAmber: '#FFB74D',   // Warnings
  
  // Background System
  background: '#0A0A0A',     // Near black (dark mode)
  surface: '#1A1A1A',        // Cards
  surfaceElevated: '#242424', // Modals
  
  // Text System
  textPrimary: '#F8FAFC',    // Primary text
  textSecondary: '#94A3B8',  // Secondary text
  textMuted: '#64748B',      // Muted text
  
  // Bear Claw Effects
  dipSplash: 'rgba(26, 92, 56, 0.3)',  // Claw wave overlay
  alertGlow: 'rgba(212, 175, 55, 0.4)', // Gold glow on alerts
  
  // Borders
  border: '#333333',
  borderActive: '#D4AF37',   // Gold active state
} as const;

export const GRADIENTS = {
  bearClaw: ['#1A5C38', '#0D2E1C'] as const,
  dipAlert: ['#8B4513', '#5C2E0A'] as const,
  profit: ['#00C853', '#00963F'] as const,
  loss: ['#FF5252', '#CC4242'] as const,
} as const;

// Contrast ratios (WCAG AA = 4.5:1 minimum)
export const CONTRAST = {
  minReadable: 4.5,
  minLargeText: 3.0,
  minUIComponent: 3.0,
} as const;
