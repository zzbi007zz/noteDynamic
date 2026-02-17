import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@quicknote_google_vision_api_key';
const OCR_ENGINE_KEY = '@quicknote_ocr_engine';

// Default API key (your hardcoded key for testing)
const DEFAULT_API_KEY = '';

/**
 * Get the stored Google Vision API key
 * @returns {Promise<string>} The API key or empty string if not set
 */
export async function getApiKey() {
  try {
    const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey !== null) {
      return storedKey;
    }
    // Return default key if no stored key
    return DEFAULT_API_KEY;
  } catch (error) {
    console.error('Error getting API key:', error);
    return DEFAULT_API_KEY;
  }
}

/**
 * Save the Google Vision API key
 * @param {string} apiKey - The API key to save
 */
export async function setApiKey(apiKey) {
  try {
    if (apiKey && apiKey.trim().length > 0) {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    } else {
      // If empty, remove the stored key to use default
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

/**
 * Get the preferred OCR engine
 * @returns {Promise<string>} 'google' or 'tesseract'
 */
export async function getOcrEngine() {
  try {
    const engine = await AsyncStorage.getItem(OCR_ENGINE_KEY);
    // Default to tesseract if no preference set
    return engine || 'tesseract';
  } catch (error) {
    console.error('Error getting OCR engine:', error);
    return 'tesseract';
  }
}

/**
 * Set the preferred OCR engine
 * @param {string} engine - 'google' or 'tesseract'
 */
export async function setOcrEngine(engine) {
  try {
    if (engine === 'google' || engine === 'tesseract') {
      await AsyncStorage.setItem(OCR_ENGINE_KEY, engine);
    }
    return true;
  } catch (error) {
    console.error('Error setting OCR engine:', error);
    return false;
  }
}

/**
 * Clear all configuration (for testing/reset)
 */
export async function clearConfig() {
  try {
    await AsyncStorage.multiRemove([API_KEY_STORAGE_KEY, OCR_ENGINE_KEY]);
    return true;
  } catch (error) {
    console.error('Error clearing config:', error);
    return false;
  }
}
