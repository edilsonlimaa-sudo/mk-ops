/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Screen backgrounds
    screenBackground: '#f9fafb',      // gray-50
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',            // gray-200
    cardTextPrimary: '#111827',       // gray-900
    cardTextSecondary: '#6b7280',     // gray-500
    // Header colors
    headerBackground: '#ffffff',
    headerText: '#11181C',
    headerBorder: '#e5e7eb',
    // Tab bar colors
    tabBarBackground: '#ffffff',
    tabBarBorder: '#e5e7eb',
    tabBarActiveTint: '#3b82f6',      // blue-500
    tabBarInactiveTint: '#6b7280',    // gray-500
    // Search input colors
    searchInputBackground: '#f3f4f6', // gray-100
    searchInputText: '#111827',       // gray-900
    searchInputPlaceholder: '#9ca3af', // gray-400
    searchInputIcon: '#9ca3af',       // gray-400
    // Filter Pill colors
    filterPillActive: '#2563eb',      // blue-600
    filterPillInactive: '#f3f4f6',    // gray-100
    filterPillTextActive: '#ffffff',
    filterPillTextInactive: '#374151', // gray-700
    filterPillBadgeActive: 'rgba(255, 255, 255, 0.3)',
    filterPillBadgeInactive: '#e5e7eb', // gray-200
    // Success colors (for historico)
    successBackground: '#dcfce7',      // green-100
    successText: '#15803d',            // green-700
    // Info row border (inside searchInputBackground)
    infoRowBorder: '#e5e7eb',          // gray-200 (mais sutil)
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Screen backgrounds
    screenBackground: '#0f172a',      // slate-900
    cardBackground: '#1e293b',        // slate-800
    cardBorder: '#334155',            // slate-700
    cardTextPrimary: '#f1f5f9',       // slate-100
    cardTextSecondary: '#94a3b8',     // slate-400
    // Header colors
    headerBackground: '#1f2937',
    headerText: '#ECEDEE',
    headerBorder: '#374151',
    // Tab bar colors
    tabBarBackground: '#1f2937',
    tabBarBorder: '#374151',
    tabBarActiveTint: '#60a5fa',      // blue-400 (lighter for dark)
    tabBarInactiveTint: '#9ca3af',    // gray-400
    // Search input colors
    searchInputBackground: '#374151', // gray-700
    searchInputText: '#f9fafb',       // gray-50
    searchInputPlaceholder: '#6b7280', // gray-500
    searchInputIcon: '#9ca3af',       // gray-400
    // Filter Pill colors
    filterPillActive: '#3b82f6',      // blue-500 (lighter for dark mode)
    filterPillInactive: '#374151',    // gray-700
    filterPillTextActive: '#ffffff',
    filterPillTextInactive: '#d1d5db', // gray-300
    filterPillBadgeActive: 'rgba(255, 255, 255, 0.2)',
    filterPillBadgeInactive: '#4b5563', // gray-600
    // Success colors (for historico)
    successBackground: '#166534',      // green-800 (darker for dark mode)
    successText: '#86efac',            // green-300
    // Info row border (inside searchInputBackground)
    infoRowBorder: '#4b5563',          // gray-600 (mais contraste que cardBorder)
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
