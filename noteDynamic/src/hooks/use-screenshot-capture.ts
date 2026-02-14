import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';

export interface ScreenshotCaptureResult {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

export interface UseScreenshotCaptureReturn {
  captureScreenshot: () => Promise<ScreenshotCaptureResult | null>;
  selectFromGallery: () => Promise<ScreenshotCaptureResult | null>;
  isCapturing: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for capturing screenshots and selecting images from gallery
 * Uses react-native-image-picker for cross-platform compatibility
 */
export const useScreenshotCapture = (): UseScreenshotCaptureReturn => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Request storage permissions (Android)
   */
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'QuickNote needs access to your storage to save screenshots.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting storage permission:', err);
      return false;
    }
  };

  /**
   * Process image picker response
   */
  const processImageResult = (
    response: ImagePickerResponse
  ): ScreenshotCaptureResult | null => {
    if (response.didCancel) {
      return null;
    }

    if (response.errorCode) {
      throw new Error(response.errorMessage || 'Image picker error');
    }

    const asset: Asset | undefined = response.assets?.[0];
    if (!asset?.uri) {
      throw new Error('No image selected');
    }

    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      fileSize: asset.fileSize,
      type: asset.type,
      fileName: asset.fileName,
    };
  };

  /**
   * Capture screenshot (using image picker as fallback)
   * In a real app, you'd use platform-specific screenshot APIs
   */
  const captureScreenshot = async (): Promise<ScreenshotCaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Request permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      // For now, use image picker as a fallback
      // In production, you'd use native screenshot APIs
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
        selectionLimit: 1,
      });

      return processImageResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture screenshot';
      setError(errorMessage);
      console.error('Screenshot capture error:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Select image from gallery
   */
  const selectFromGallery = async (): Promise<ScreenshotCaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Request permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
        selectionLimit: 1,
      });

      return processImageResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select image';
      setError(errorMessage);
      console.error('Image selection error:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    captureScreenshot,
    selectFromGallery,
    isCapturing,
    error,
    clearError,
  };
};
