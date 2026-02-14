import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/app-navigator';
import {ThemeProvider} from './src/theme/theme-provider';
import {DatabaseProvider} from './src/data/database/database-provider';
import {shareHandler} from './src/services/share-handler';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize share handler to process shared content
    shareHandler.initialize();

    // Cleanup on unmount
    return () => {
      shareHandler.dispose();
    };
  }, []);

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
