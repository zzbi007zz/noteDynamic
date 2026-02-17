import {NativeModules, AppState, Platform} from 'react-native';
import {useNoteStore} from '../store/note-store';

const {ShareModule} = NativeModules;

export interface SharedContent {
  type: 'text' | 'url' | 'image';
  content: string;
  metadata?: {
    title?: string;
    source?: string;
    timestamp: number;
  };
  imageUri?: string;
}

/**
 * Share Handler - Processes shared content from iOS Share Extension and Android Intent
 * Enables quick note creation from Facebook and other apps
 */
export class ShareHandler {
  private initialized = false;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Listen for app state changes to check for shared content
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
    this.initialized = true;

    // Check for shared content on init (in case app was launched from share)
    await this.checkForSharedContent();
  }

  private handleAppStateChange = async (nextState: string): Promise<void> => {
    if (nextState === 'active') {
      await this.checkForSharedContent();
    }
  };

  async checkForSharedContent(): Promise<void> {
    // Skip if no native module (development mode without native code)
    if (!ShareModule) {
      console.log('ShareModule not available - running in development mode');
      return;
    }

    try {
      const content = await ShareModule.getSharedContent();
      if (content) {
        await this.processSharedContent(content);
        // Clear shared content after processing
        await ShareModule.clearSharedContent();
      }
    } catch (error) {
      console.error('Error checking shared content:', error);
    }
  }

  async processSharedContent(shared: SharedContent): Promise<void> {
    // Validate content type
    const validTypes = ['text', 'url', 'image'];
    if (!shared.type || !validTypes.includes(shared.type)) {
      console.error('Invalid shared content type:', shared.type);
      return;
    }

    // Validate content exists
    if (!shared.content && !shared.imageUri) {
      console.error('No content provided in shared content');
      return;
    }

    let noteContent = shared.content;

    // If it's an image, process with OCR
    if (shared.type === 'image' && shared.imageUri) {
      try {
        const ocrResult = await this.processImageOCR(shared.imageUri);
        noteContent = ocrResult || shared.content;
      } catch (error) {
        console.error('OCR failed for shared image:', error);
      }
    }

    // Extract metadata
    const metadata = this.extractMetadata(shared);

    // Create note with shared content
    const { createNote } = useNoteStore.getState();
    await createNote({
      content: noteContent,
      source: metadata?.source,
      sharedAt: metadata?.timestamp,
    });
  }

  private async processImageOCR(imageUri: string): Promise<string | null> {
    try {
      // Dynamically import to avoid circular dependencies
      const {ocrService} = await import('./ocr-service');
      const result = await ocrService.recognizeText(imageUri);
      return result;
    } catch (error) {
      console.error('OCR processing failed:', error);
      return null;
    }
  }

  private extractMetadata(shared: SharedContent): SharedContent['metadata'] {
    // Try to extract URL from content
    const urlMatch = shared.content.match(/(https?:\/\/[^\s]+)/);
    let source: string | undefined;

    if (urlMatch) {
      try {
        const url = new URL(urlMatch[1]);
        source = url.hostname;
      } catch {
        // Invalid URL, ignore
      }
    }

    return {
      source,
      timestamp: Date.now(),
    };
  }

  /**
   * Handle deep link from shared content
   */
  async handleDeepLink(url: string): Promise<void> {
    // Parse the deep link and navigate to appropriate screen
    console.log('Deep link received:', url);
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const shareHandler = new ShareHandler();
