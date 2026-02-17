import React from 'react';
import {PaperProvider, MD3LightTheme} from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    onSurface: '#1e293b',
    error: '#ef4444',
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
