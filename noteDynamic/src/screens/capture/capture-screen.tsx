import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors } from '../../theme';
import { Button } from '../../components/button';
import { Card } from '../../components/card';

import { useScreenshotCapture } from '../../hooks/use-screenshot-capture';
import { ocrService, OCRResult } from '../../services/ocr-service';

export const CaptureScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const {
    captureScreenshot,
    selectFromGallery,
    isCapturing: isCapturingImage,
    error: captureError,
    clearError,
  } = useScreenshotCapture();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const handleCapture = async () => {
    clearError();
    const result = await captureScreenshot();

    if (result) {
      setImageUri(result.uri);
      await processOCR(result.uri);
    }
  };

  const handleSelectFromGallery = async () => {
    clearError();
    const result = await selectFromGallery();

    if (result) {
      setImageUri(result.uri);
      await processOCR(result.uri);
    }
  };

  const processOCR = async (uri: string) => {
    setIsProcessingOCR(true);

    try {
      const result = await ocrService.recognizeText(uri, {
        preferCloud: false,
        languageHints: ['en', 'vi'],
      });

      setOcrResult(result);

      // Navigate to OCR review screen
      navigation.navigate('OCRReview', {
        imageUri: uri,
        ocrResult: result,
      });
    } catch (error) {
      console.error('OCR processing failed:', error);
      Alert.alert(
        'OCR Failed',
        'Failed to extract text from image. Please try again or enter text manually.'
      );
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const isProcessing = isCapturingImage || isProcessingOCR;

  // If we have an OCR result, show success state
  if (ocrResult) {
    return (
      <View style={styles.container}>
        <Card style={styles.successCard}>
          <Icon
            name="check-circle"
            size={64}
            color={colors.success}
            style={styles.successIcon}
          />
          <Text style={styles.successTitle}>Text Extracted!</Text>
          <Text style={styles.successSubtitle}>
            Successfully extracted {ocrResult.text.length} characters
          </Text>

          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}

          <View style={styles.buttonRow}>
            <Button
              title="Review & Edit"
              onPress={() =>
                navigation.navigate('OCRReview', {
                  imageUri: imageUri!,
                  ocrResult,
                })
              }
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Capture Another"
              onPress={() => {
                setOcrResult(null);
                setImageUri(null);
              }}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </View>
    );
  }

  // Initial capture state
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon name="camera" size={48} color={colors.primary} />
        </View>
      </View>

      <Text style={styles.title}>Capture Screenshot</Text>
      <Text style={styles.subtitle}>
        Take a screenshot or select an image to extract text using OCR
      </Text>

      {captureError && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.errorText}>{captureError}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Capture Screenshot"
          onPress={handleCapture}
          loading={isProcessing}
          disabled={isProcessing}
          icon={<Icon name="camera" size={20} color={colors.white} />}
          size="large"
          style={styles.captureButton}
        />

        <Button
          title="Select from Gallery"
          onPress={handleSelectFromGallery}
          loading={isProcessing}
          disabled={isProcessing}
          variant="outline"
          icon={<Icon name="image" size={20} color={colors.primary} />}
          size="large"
          style={styles.galleryButton}
        />
      </View>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>Processing image...</Text>
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tips for best results:</Text>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={colors.success} style={styles.tipIcon} />
          <Text style={styles.tipText}>Use clear, well-lit images</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={colors.success} style={styles.tipIcon} />
          <Text style={styles.tipText}>Avoid skewed or rotated text</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color={colors.success} style={styles.tipIcon} />
          <Text style={styles.tipText}>Use high resolution when possible</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray800,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 8,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 32,
    marginTop: 24,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
  },
  buttonContainer: {
    marginTop: 32,
    marginHorizontal: 32,
    gap: 12,
  },
  captureButton: {
    width: '100%',
  },
  galleryButton: {
    width: '100%',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  processingText: {
    fontSize: 16,
    color: colors.gray600,
    fontWeight: '500',
  },
  tipsContainer: {
    marginTop: 40,
    marginHorizontal: 32,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray600,
  },
  // Success state styles
  successCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});

