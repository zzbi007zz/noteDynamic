import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth-store';
import { useDatabase } from '../data/database/database-provider';
import { AuthNavigator } from './auth-navigator';
import { MainNavigator } from './main-navigator';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { initialize, isInitialized } = useDatabase();
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize database when user logs in
  useEffect(() => {
    if (user && !isInitialized && !isInitializing) {
      setIsInitializing(true);
      initialize(user.id)
        .catch((error) => {
          console.error('[AppNavigator] Failed to initialize database:', error);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [user, isInitialized, isInitializing, initialize]);

  const isLoading = isAuthLoading || isInitializing;

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
