import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/app-navigator';
import {ThemeProvider} from './src/theme/theme-provider';
import {DatabaseProvider} from './src/data/database/database-provider';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatabaseProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <AppNavigator />
        </DatabaseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
