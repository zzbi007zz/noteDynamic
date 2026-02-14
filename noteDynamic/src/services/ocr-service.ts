import { Platform } from 'react-native';
import { firebaseConfig } from '../config/firebase';

export interface OCRResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCROptions {
  preferCloud?: boolean;
  languageHints?: string[];
  enableAutoSearch?: boolean;
}

/**
 * OCR Service using Firebase ML Kit
 * Supports both on-device and cloud-based text recognition
 */
export class OCRService {
  private isProcessing: boolean = false;

  /**
   * Perform OCR on an image
   */
  async recognizeText(
    imageUri: string,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    if (this.isProcessing) {
      throw new Error('OCR is already processing. Please wait.');
    }

    this.isProcessing = true;

    try {
      const { preferCloud = false, languageHints = ['en'] } = options;

      // Try on-device first for speed and privacy
      if (!preferCloud) {
        try {
          const result = await this.recognizeOnDevice(imageUri, languageHints);
          if (result.confidence > 0.7) {
            return result;
          }
          // If confidence is low, fall through to cloud
        } catch (error) {
          console.warn('[OCRService] On-device OCR failed, falling back to cloud:', error);
        }
      }

      // Use cloud OCR for better accuracy
      return await this.recognizeInCloud(imageUri, languageHints);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * On-device text recognition using Firebase ML Kit
   */
  private async recognizeOnDevice(
    imageUri: string,
    languageHints: string[]
  ): Promise<OCRResult> {
    // Dynamically import Firebase ML Kit
    const { getML, getTextRecognizer } = await import('firebase/ml');

    const ml = getML();
    const textRecognizer = getTextRecognizer(ml);

    // Process image
    const result = await textRecognizer.processImage(imageUri);

    return {
      text: result.text,
      blocks: result.blocks.map((block: any) => ({
        text: block.text,
        confidence: block.confidence || 0.8,
        boundingBox: block.boundingBox,
      })),
      confidence: this.calculateConfidence(result.blocks),
    };
  }

  /**
   * Cloud-based text recognition using Firebase ML Kit Cloud
   */
  private async recognizeInCloud(
    imageUri: string,
    languageHints: string[]
  ): Promise<OCRResult> {
    // Dynamically import Firebase ML Kit
    const { getML, getCloudTextRecognizer } = await import('firebase/ml');

    const ml = getML();
    const cloudTextRecognizer = getCloudTextRecognizer(ml, {
      languageHints,
    });

    // Process image
    const result = await cloudTextRecognizer.processImage(imageUri);

    return {
      text: result.text,
      blocks: result.blocks.map((block: any) => ({
        text: block.text,
        confidence: block.confidence || 0.95, // Cloud typically has higher confidence
        boundingBox: block.boundingBox,
      })),
      confidence: this.calculateConfidence(result.blocks),
    };
  }

  /**
   * Extract keywords from OCR text for auto-search
   */
  extractKeywords(text: string, maxKeywords: number = 5): string[] {
    // Remove special characters and split into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Count word frequency
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imageUri: string): Promise<string> {
    // For React Native, we would use image manipulation libraries
    // like react-native-image-resizer or expo-image-manipulator
    // This is a placeholder for actual implementation
    return imageUri;
  }

  /**
   * Calculate average confidence from text blocks
   */
  private calculateConfidence(blocks: any[]): number {
    if (blocks.length === 0) return 0;
    const sum = blocks.reduce((acc, block) => acc + (block.confidence || 0), 0);
    return sum / blocks.length;
  }

  /**
   * Check if OCR is currently processing
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const ocrService = new OCRService();
