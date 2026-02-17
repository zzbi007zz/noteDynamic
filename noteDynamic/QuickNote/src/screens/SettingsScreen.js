import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  getApiKey,
  setApiKey,
  getOcrEngine,
  setOcrEngine,
  clearConfig,
} from '../services/config-service';

const COLORS = {
  primary: '#6366f1',
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
};

export default function SettingsScreen({ navigation }) {
  const [apiKey, setApiKeyState] = useState('');
  const [storedApiKey, setStoredApiKey] = useState('');
  const [ocrEngine, setOcrEngineState] = useState('tesseract');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const [key, engine] = await Promise.all([
        getApiKey(),
        getOcrEngine(),
      ]);

      // Mask the stored key (show only last 4 chars)
      if (key && key.length > 4) {
        setStoredApiKey('•'.repeat(key.length - 4) + key.slice(-4));
      } else if (key) {
        setStoredApiKey(key);
      } else {
        setStoredApiKey('');
      }

      setOcrEngineState(engine || 'tesseract');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      setIsSaving(true);
      const success = await setApiKey(apiKey.trim());

      if (success) {
        Alert.alert('Success', 'API key saved successfully!');
        setApiKeyState('');
        await loadSettings();
      } else {
        Alert.alert('Error', 'Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove the stored API key? This will fall back to on-device OCR (Tesseract.js).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await setApiKey('');
              Alert.alert('Success', 'API key cleared');
              await loadSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear API key');
            }
          },
        },
      ]
    );
  };

  const handleOcrEngineChange = async (engine) => {
    try {
      await setOcrEngine(engine);
      setOcrEngineState(engine);

      if (engine === 'google') {
        Alert.alert(
          'Google Vision API Selected',
          'Make sure you have configured a valid Google Vision API key for best accuracy.'
        );
      }
    } catch (error) {
      console.error('Error setting OCR engine:', error);
      Alert.alert('Error', 'Failed to change OCR engine');
    }
  };

  const handleResetAll = async () => {
    Alert.alert(
      'Reset All Settings',
      'This will clear all settings including API keys. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearConfig();
              Alert.alert('Success', 'All settings have been reset');
              await loadSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* OCR Engine Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OCR Engine</Text>
          <Text style={styles.sectionDescription}>
            Choose the text recognition engine for extracting text from images.
          </Text>

          <View style={styles.engineOptions}>
            {/* Tesseract Option */}
            <TouchableOpacity
              style={[
                styles.engineOption,
                ocrEngine === 'tesseract' && styles.engineOptionSelected,
              ]}
              onPress={() => handleOcrEngineChange('tesseract')}
            >
              <View style={styles.engineOptionHeader}>
                <View
                  style={[
                    styles.radioButton,
                    ocrEngine === 'tesseract' && styles.radioButtonSelected,
                  ]}
                />
                <Text style={styles.engineOptionTitle}>Tesseract.js</Text>
              </View>
              <Text style={styles.engineOptionDescription}>
                On-device OCR. Works offline. Free but less accurate for complex
                images.
              </Text>
            </TouchableOpacity>

            {/* Google Vision Option */}
            <TouchableOpacity
              style={[
                styles.engineOption,
                ocrEngine === 'google' && styles.engineOptionSelected,
              ]}
              onPress={() => handleOcrEngineChange('google')}
            >
              <View style={styles.engineOptionHeader}>
                <View
                  style={[
                    styles.radioButton,
                    ocrEngine === 'google' && styles.radioButtonSelected,
                  ]}
                />
                <Text style={styles.engineOptionTitle}>Google Vision API</Text>
              </View>
              <Text style={styles.engineOptionDescription}>
                Cloud-based OCR. Requires API key. Highly accurate for all image
                types.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Key Configuration */}
        {ocrEngine === 'google' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Google Vision API Key</Text>
            <Text style={styles.sectionDescription}>
              Enter your Google Vision API key to enable cloud-based OCR. Get
              your key from the{' '}
              <Text
                style={styles.link}
                onPress={() =>
                  Alert.alert(
                    'Google Cloud Console',
                    'Visit https://console.cloud.google.com/ to get your API key'
                  )
                }
              >
                Google Cloud Console
              </Text>
              .
            </Text>

            {/* Current API Key Status */}
            {storedApiKey ? (
              <View style={styles.apiKeyStatus}>
                <Text style={styles.apiKeyStatusLabel}>
                  Stored API Key:
                </Text>
                <Text style={styles.apiKeyStatusValue}>{storedApiKey}</Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearApiKey}
                >
                  <Text style={styles.clearButtonText}>Clear API Key</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.apiKeyStatus}>
                <Text style={styles.apiKeyStatusLabel}>No API Key Configured</Text>
                <Text style={styles.apiKeyStatusHint}>
                  The app will use the default on-device OCR (Tesseract.js)
                  unless you add an API key.
                </Text>
              </View>
            )}

            {/* New API Key Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter New API Key</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={apiKey}
                  onChangeText={setApiKeyState}
                  placeholder="Paste your Google Vision API key here"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowApiKey(!showApiKey)}
                >
                  <Text style={styles.showButtonText}>
                    {showApiKey ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!apiKey.trim() || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveApiKey}
              disabled={!apiKey.trim() || isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save API Key'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reset Section */}
        <View style={[styles.section, styles.resetSection]}>
          <Text style={styles.sectionTitle}>Reset Settings</Text>
          <Text style={styles.sectionDescription}>
            Clear all settings including API keys and preferences.
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetAll}
          >
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.gray600,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resetSection: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '20',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 16,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  engineOptions: {
    gap: 12,
  },
  engineOption: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  engineOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  engineOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  engineOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  engineOptionDescription: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
    marginLeft: 32,
  },
  apiKeyStatus: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  apiKeyStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  apiKeyStatusValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  apiKeyStatusHint: {
    fontSize: 13,
    color: COLORS.gray500,
    lineHeight: 18,
  },
  clearButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.gray800,
  },
  showButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  showButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  resetButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
});
