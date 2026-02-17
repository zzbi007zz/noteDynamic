import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CaptureScreen } from '../screens/capture/capture-screen';
import { OCRReviewScreen } from '../screens/ocr/ocr-review-screen';

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

const Stack = createNativeStackNavigator<CaptureStackParamList>();

export const CaptureNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Capture" component={CaptureScreen} />
      <Stack.Screen
        name="OCRReview"
        component={OCRReviewScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
