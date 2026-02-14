import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tabs
export type MainTabParamList = {
  Notes: undefined;
  Capture: undefined;
  Settings: undefined;
};

// Capture Stack (for OCR flow)
export type CaptureStackParamList = {
  Capture: undefined;
  OCRReview: {
    imageUri: string;
    ocrResult: {
      text: string;
      blocks: any[];
      confidence: number;
    };
    sourceUrl?: string;
  };
};

// Nested Navigator Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Navigation Prop Types for useNavigation
export type RootStackNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];
export type AuthStackNavigationProp = NativeStackScreenProps<AuthStackParamList>['navigation'];
export type MainTabNavigationProp = BottomTabScreenProps<MainTabParamList>['navigation'];
