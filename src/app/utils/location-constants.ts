import { Wallet, Landmark, PiggyBank, TrendingUp } from 'lucide-react';

/**
 * Centralized location definitions
 * Used across the app for consistency
 */

export type Location = 'wallet' | 'bank' | 'jar' | 'other';

export const locationIcons = {
  wallet: Wallet,
  bank: Landmark,
  jar: PiggyBank,
  other: TrendingUp,
} as const;

export const locationLabels = {
  wallet: 'Wallet',
  bank: 'Bank',
  jar: 'Piggy Bank',
  other: 'Other',
} as const;

export const locationColors = {
  wallet: 'text-green-600 bg-green-100',
  bank: 'text-blue-600 bg-blue-100',
  jar: 'text-orange-600 bg-orange-100',
  other: 'text-amber-600 bg-amber-100',
} as const;

export const locationGradients = {
  wallet: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-900',
  bank: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900',
  jar: 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-900',
  other: 'bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-900',
} as const;

export const locationSegmentStyles = {
  wallet: {
    selectedGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    deselectedGradient: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
    iconColor: 'text-emerald-900',
    textColor: 'text-emerald-900'
  },
  bank: {
    selectedGradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
    deselectedGradient: 'bg-gradient-to-r from-blue-50 to-blue-100',
    iconColor: 'text-blue-900',
    textColor: 'text-blue-900'
  },
  jar: {
    selectedGradient: 'bg-gradient-to-r from-pink-500 to-pink-400',
    deselectedGradient: 'bg-gradient-to-r from-pink-50 to-pink-100',
    iconColor: 'text-pink-900',
    textColor: 'text-pink-900'
  },
  other: {
    selectedGradient: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    deselectedGradient: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    iconColor: 'text-amber-900',
    textColor: 'text-amber-900'
  },
} as const;

// Wave pattern colors for location cards (matching the darker text colors)
export const locationWaveColors = {
  wallet: '%23064e3b', // emerald-900
  bank: '%231e3a8a', // blue-900
  jar: '%23831843', // pink-900
  other: '%2378350f', // amber-900
} as const;