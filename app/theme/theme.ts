// app/theme/theme.ts
import { DefaultTheme } from 'react-native-paper';
import { Colors } from '../../constants/Colors';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    accent: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    text: Colors.text,
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
    info: Colors.info,
    onSurface: Colors.text,
    disabled: Colors.gray,
    placeholder: Colors.gray,
    backdrop: Colors.dark,
    notification: Colors.primary,
  },
  roundness: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export type AppTheme = typeof theme;

// Default export to fix the expo-router error
export default theme;