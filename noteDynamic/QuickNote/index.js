import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, SafeAreaView, Image, Platform, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Tesseract from 'tesseract.js';
import { getApiKey, getOcrEngine } from './src/services/config-service';
import SettingsScreen from './src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

const NOTES_STORAGE_KEY = '@quicknote_notes';

const defaultNotes = [
  { id: '1', title: 'Shopping List', content: 'Milk, eggs, bread, butter...', updatedAt: new Date().toISOString() },
  { id: '2', title: 'Meeting Notes', content: 'Discussed project timeline...', updatedAt: new Date(Date.now() - 86400000).toISOString() },
];

const COLORS = {
  primary: '#6366f1',
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8fafc',
  gray200: '#e2e8f0',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  error: '#dc2626',
};

// Function to extract URLs from text
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Function to parse content and extract URL badges
function parseContentWithBadges(content) {
  if (!content) return [];

  const parts = [];
  const badgeRegex = /\[\[URL_BADGE:(\{[^\]]+\})\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = badgeRegex.exec(content)) !== null) {
    // Add text before badge
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index).trim()
      });
    }

    // Parse badge data
    try {
      const badgeData = JSON.parse(match[1]);
      parts.push({
        type: 'badge',
        data: badgeData
      });
    } catch (e) {
      console.error('Failed to parse badge data:', e);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim();
    if (remaining) {
      parts.push({
        type: 'text',
        content: remaining
      });
    }
  }

  return parts;
}

// Function to fetch website metadata (title, description, favicon)
async function fetchUrlMetadata(url) {
  try {
    console.log('Fetching metadata from URL:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract metadata using regex
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Try Open Graph description first, then meta description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
    const description = ogDescMatch ? ogDescMatch[1] : (metaDescMatch ? metaDescMatch[1] : '');

    // Try Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)/i);
    const imageUrl = ogImageMatch ? ogImageMatch[1] : null;

    // Try to find favicon
    let faviconUrl = null;
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']*)/i);
    if (faviconMatch) {
      faviconUrl = faviconMatch[1];
      // Convert relative URL to absolute
      if (faviconUrl.startsWith('/')) {
        const urlObj = new URL(url);
        faviconUrl = `${urlObj.protocol}//${urlObj.host}${faviconUrl}`;
      }
    }

    return {
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return {
      url,
      title: url,
      description: `Error: ${error.message}`,
      imageUrl: null,
      faviconUrl: null,
      fetchedAt: new Date().toISOString()
    };
  }
}

// Helper function to convert image URI to base64
// Supports both local file URIs (file://) and remote URLs (http://, https://)
async function getBase64FromUri(uri) {
  try {
    console.log('Converting image to base64:', uri.substring(0, 50) + '...');

    // Check if it's a data URI (already base64)
    if (uri.startsWith('data:')) {
      console.log('Image is already a data URI, extracting base64...');
      const base64 = uri.split(',')[1];
      if (!base64) {
        throw new Error('Invalid data URI format');
      }
      return base64;
    }

    // For both local file URIs and remote URLs, use fetch
    // React Native's fetch can handle file:// URIs
    console.log('Fetching image...');
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    console.log('Converting to blob...');
    const blob = await response.blob();

    console.log('Reading blob as base64...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          // reader.result is a data URL like "data:image/jpeg;base64,/9j/4AAQ..."
          const dataUrl = reader.result;
          const base64 = dataUrl.split(',')[1];

          if (!base64) {
            reject(new Error('Failed to extract base64 from data URL'));
            return;
          }

          console.log('Base64 conversion successful, length:', base64.length);
          resolve(base64);
        } catch (error) {
          reject(new Error(`Error processing base64: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('FileReader error: Failed to read blob as data URL'));
      };

      reader.onabort = () => {
        reject(new Error('FileReader aborted'));
      };

      // Start reading the blob as data URL
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    console.error('Image URI type:', uri.startsWith('file:') ? 'local file' : uri.startsWith('http') ? 'remote URL' : 'unknown');
    throw new Error(`Failed to convert image to base64: ${error.message}. Make sure the image is accessible.`);
  }
}

// Google Vision API OCR function
async function parseImageWithGoogleVision(imageUri) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('Google Vision API key is not configured. Please add your API key in Settings.');
  }

  try {
    console.log('Converting image to base64...');
    const base64Image = await getBase64FromUri(imageUri);

    console.log('Sending request to Google Vision API...');
    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Google Vision API request failed');
    }

    const textAnnotation = data.responses[0]?.fullTextAnnotation;

    if (!textAnnotation || !textAnnotation.text) {
      return '[No text found in image]\n\nThe Google Vision API could not detect any readable text in this image.';
    }

    const extractedText = textAnnotation.text.trim();
    const pages = textAnnotation.pages || [];
    let confidence = 0;

    if (pages.length > 0 && pages[0].confidence) {
      confidence = Math.round(pages[0].confidence);
    }

    return `[Text extracted with ${confidence > 0 ? confidence + '%' : 'high'} confidence using Google Vision API]\n\n${extractedText}`;
  } catch (error) {
    console.error('Google Vision OCR Error:', error);
    return `[Google Vision OCR Error]\n\nFailed to extract text from image:\n${error.message}\n\nPlease check your API key and try again.`;
  }
}

// Tesseract.js OCR function (fallback when no API key)
async function parseImageWithTesseract(imageUri) {
  try {
    console.log('Starting Tesseract.js OCR...');
    const result = await Tesseract.recognize(
      imageUri,
      'eng',
      {
        logger: (m) => console.log('Tesseract Progress:', m),
        errorHandler: (err) => console.error('Tesseract Error:', err),
      }
    );

    const extractedText = result.data.text.trim();
    const confidence = Math.round(result.data.confidence);

    if (!extractedText) {
      return `[No text found in image]\n\nThe OCR engine could not detect any readable text in this image.\nConfidence: ${confidence}%`;
    }

    return `[Text extracted with ${confidence}% confidence using on-device OCR]\n\n${extractedText}`;
  } catch (error) {
    console.error('Tesseract OCR Error:', error);
    return `[OCR Error]\n\nFailed to extract text from image:\n${error.message}\n\nPlease try again with a clearer image.`;
  }
}

// Main OCR function that chooses the best available method
async function parseImageToText(imageUri) {
  // Get user preferences
  const [apiKey, preferredEngine] = await Promise.all([
    getApiKey(),
    getOcrEngine(),
  ]);

  // Determine which engine to use
  const useGoogleVision = preferredEngine === 'google' && apiKey;

  if (useGoogleVision) {
    console.log('Using Google Vision API for OCR...');
    return await parseImageWithGoogleVision(imageUri);
  }

  // Otherwise, fall back to Tesseract.js on-device OCR
  console.log('Using Tesseract.js on-device OCR...');
  return await parseImageWithTesseract(imageUri);
}

// Notes List Screen
function NotesListScreen({ navigation, route }) {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from AsyncStorage on mount
  React.useEffect(() => {
    loadNotes();
  }, []);

  // Save notes to AsyncStorage whenever notes change
  React.useEffect(() => {
    if (!isLoading) {
      saveNotes();
    }
  }, [notes, isLoading]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      let parsedNotes = [];

      if (storedNotes !== null) {
        parsedNotes = JSON.parse(storedNotes);
        if (!Array.isArray(parsedNotes) || parsedNotes.length === 0) {
          parsedNotes = defaultNotes;
        }
      } else {
        // First time app launch - use default notes
        parsedNotes = defaultNotes;
      }

      // Check if there's a newNote from navigation params (after creating a note)
      if (route.params?.newNote) {
        // Check if note with same ID already exists to avoid duplicates
        const existingIndex = parsedNotes.findIndex(n => n.id === route.params.newNote.id);
        if (existingIndex === -1) {
          parsedNotes = [route.params.newNote, ...parsedNotes];
        }
        // Clear the param after processing
        navigation.setParams({ newNote: undefined });
      }

      // Check if there's an updatedNote from navigation params (after editing a note)
      if (route.params?.updatedNote) {
        const updatedNote = route.params.updatedNote;
        const existingIndex = parsedNotes.findIndex(n => n.id === updatedNote.id);
        if (existingIndex !== -1) {
          // Replace the existing note
          parsedNotes[existingIndex] = updatedNote;
        } else {
          // If not found, add it (shouldn't happen, but just in case)
          parsedNotes = [updatedNote, ...parsedNotes];
        }
        // Clear the param after processing
        navigation.setParams({ updatedNote: undefined });
      }

      setNotes(parsedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes(defaultNotes);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Handle note deleted from NoteDetail screen
  React.useEffect(() => {
    if (route.params?.deletedNoteId) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== route.params.deletedNoteId));
      navigation.setParams({ deletedNoteId: undefined });
    }
  }, [route.params?.deletedNoteId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerSubtitle}>{notes.length} notes</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => navigation.navigate('NoteDetail', { note: item })}
          >
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddNote')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Add Note Screen
function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const processImageForOcr = async (imageUri) => {
    setSelectedImage(imageUri);
    setIsProcessing(true);

    try {
      // Step 1: Extract text from image using OCR
      const extractedText = await parseImageToText(imageUri);

      // Step 2: Extract URLs from the OCR text
      const urls = extractUrls(extractedText);
      console.log('Found URLs in image:', urls);

      // Step 3: Fetch metadata for each URL and create badges
      let urlBadges = '';
      if (urls.length > 0) {
        Alert.alert(
          'URLs Detected',
          `Found ${urls.length} URL(s) in the image. Fetching metadata...`,
          [{ text: 'OK' }]
        );

        for (const url of urls) {
          try {
            const metadata = await fetchUrlMetadata(url);
            // Store metadata as JSON string for badge rendering
            const badgeData = {
              type: 'url-badge',
              ...metadata
            };
            // Store as special marker that can be parsed later
            const badgeMarker = `[[URL_BADGE:${JSON.stringify(badgeData)}]]`;
            urlBadges += `\n\n${badgeMarker}`;
          } catch (error) {
            console.error(`Error fetching metadata for ${url}:`, error);
            // Create a simple error badge without decorative headers
            const errorBadgeData = {
              type: 'url-badge',
              url: url,
              title: url,
              description: 'Could not fetch page info',
              faviconUrl: null,
              fetchedAt: new Date().toISOString()
            };
            const errorBadgeMarker = `[[URL_BADGE:${JSON.stringify(errorBadgeData)}]]`;
            urlBadges += `\n\n${errorBadgeMarker}`;
          }
        }
      }

      // Step 4: Clean up extracted text and combine with badges
      // If URLs were found, only show URL badges (skip the messy OCR text)
      let finalContent;

      if (urls.length > 0 && urlBadges) {
        // URLs found - only show URL badges, skip OCR text entirely
        finalContent = urlBadges;
      } else {
        // No URLs found - show cleaned OCR text
        const cleanedText = extractedText
          .replace(/\n{3,}/g, '\n\n')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/^\s*[\d\s]+(?:shares?|reactions?|comments?|likes?)\s*$/gim, '')
          .replace(/^\s*(?:Most relevant|Top comments|View more comments?)\s*$/gim, '')
          .replace(/^\s*(?:Author|Admin|Mod)\s*$/gim, '')
          .replace(/^\s*\d+\s*(?:w|d|h|m|s)\s*$/gim, '')
          .replace(/^\s*(?:Reply|Like|Share|More)\s*$/gim, '')
          .replace(/^\s*[\w\s]+\s+\+\s*\d+\s*$/gim, '')
          .trim();

        finalContent = cleanedText.length > 10 ? cleanedText : '[No readable text found]';
      }

      // When URLs are found, show ONLY the URL badges and discard all other text
      if (urls.length > 0 && urlBadges) {
        setContent(urlBadges);
      } else if (finalContent) {
        setContent(prev => {
          const separator = prev.length > 0 ? '\n\n---\n\n' : '';
          return prev + separator + finalContent;
        });
      }

      if (!title) {
        setTitle('Extracted from Image');
      }

      Alert.alert('Success', `Text extracted from image${urls.length > 0 ? ' and content fetched from ' + urls.length + ' URL(s)' : ''}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to extract text: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        await processImageForOcr(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const processImageFromUrl = async () => {
    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const url = imageUrl.trim();

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Error', 'URL must start with http:// or https://');
      return;
    }

    try {
      setIsProcessing(true);
      await processImageForOcr(url);
      setImageUrl('');
      setShowUrlInput(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process image from URL: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveNote = () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please enter a title or content');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled',
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };

    // Navigate back immediately with the note (don't wait for alert)
    navigation.navigate('NotesList', { newNote });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.addHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.addHeaderTitle}>New Note</Text>
        <TouchableOpacity onPress={saveNote} disabled={isProcessing}>
          <Text style={[styles.saveButton, isProcessing && { opacity: 0.5 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImage}
          disabled={isProcessing}
        >
          <Text style={styles.imageUploadText}>
            {isProcessing ? '📷 Processing...' : '📷 Upload Screenshot to Extract Text'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageUploadButton, { backgroundColor: COLORS.gray600, marginTop: 8 }]}
          onPress={() => setShowUrlInput(!showUrlInput)}
          disabled={isProcessing}
        >
          <Text style={styles.imageUploadText}>
            {showUrlInput ? '✕ Close URL Input' : '🔗 Enter Image URL'}
          </Text>
        </TouchableOpacity>

        {showUrlInput && (
          <View style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com/image.png"
              placeholderTextColor={COLORS.gray400}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={[styles.urlProcessButton, (!imageUrl.trim() || isProcessing) && styles.urlProcessButtonDisabled]}
              onPress={processImageFromUrl}
              disabled={!imageUrl.trim() || isProcessing}
            >
              <Text style={styles.urlProcessButtonText}>
                {isProcessing ? 'Processing...' : 'Extract Text'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <Text style={styles.imageInfo}>Text extracted and added below</Text>
          </View>
        )}

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={COLORS.gray400}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.contentInput, { color: COLORS.gray800 }]}
          placeholder="Write your note here... Or upload a screenshot to extract text automatically!"
          placeholderTextColor={COLORS.gray400}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// URL Badge Component
function UrlBadge({ data }) {
  const { url, title, description, faviconUrl } = data;

  const openUrl = () => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open URL');
    });
  };

  return (
    <TouchableOpacity onPress={openUrl} style={badgeStyles.container}>
      <View style={badgeStyles.content}>
        {faviconUrl && (
          <Image source={{ uri: faviconUrl }} style={badgeStyles.favicon} />
        )}
        <View style={badgeStyles.textContainer}>
          <Text style={badgeStyles.title} numberOfLines={1}>{title || url}</Text>
          {description && (
            <Text style={badgeStyles.description} numberOfLines={2}>{description}</Text>
          )}
          <Text style={badgeStyles.url} numberOfLines={1}>{url}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.gray100,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    color: COLORS.primary,
  },
});

// Detail Screen
function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  // Parse content to separate text and badges
  const contentParts = parseContentWithBadges(note.content);

  const deleteNote = () => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Deleted', 'Note has been removed', [
            { text: 'OK', onPress: () => navigation.navigate('NotesList', { deletedNoteId: note.id }) }
          ]);
        },
      },
    ]);
  };

  const saveEdit = () => {
    if (!editTitle.trim() && !editContent.trim()) {
      Alert.alert('Error', 'Please enter a title or content');
      return;
    }

    const updatedNote = {
      ...note,
      title: editTitle.trim() || 'Untitled',
      content: editContent.trim(),
      updatedAt: new Date().toISOString(),
    };

    setIsEditing(false);
    navigation.navigate('NotesList', { updatedNote });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {!isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.backButton, { color: COLORS.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteNote}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={saveEdit}>
              <Text style={[styles.backButton, { color: COLORS.primary }]}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.detailContent}>
        {!isEditing ? (
          <>
            <Text style={styles.detailTitle}>{note.title}</Text>
            <Text style={styles.detailDate}>
              {new Date(note.updatedAt).toLocaleDateString()}
            </Text>

            {/* Render content parts (text and badges) */}
            {contentParts.map((part, index) => (
              part.type === 'badge' ? (
                <UrlBadge key={index} data={part.data} />
              ) : (
                <Text key={index} style={[styles.detailBody, { color: COLORS.gray800 }]}>
                  {part.content}
                </Text>
              )
            ))}
          </>
        ) : (
          <>
            <TextInput
              style={styles.detailTitleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor={COLORS.gray400}
            />
            <TextInput
              style={styles.detailContentInput}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Note content..."
              placeholderTextColor={COLORS.gray400}
              multiline
              textAlignVertical="top"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.gray800 },
  headerSubtitle: { fontSize: 14, color: COLORS.gray500 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  settingsButton: { marginLeft: 12, padding: 8 },
  settingsButtonText: { fontSize: 20 },
  listContent: { padding: 16, paddingBottom: 100 },
  noteCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  noteTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 4 },
  noteContent: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabText: { fontSize: 24, color: COLORS.white, fontWeight: '300' },
  addHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  backButton: { fontSize: 16, color: COLORS.gray600 },
  addHeaderTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  saveButton: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  formContainer: { flex: 1, padding: 20 },
  titleInput: { fontSize: 24, fontWeight: '700', color: COLORS.gray800, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, marginBottom: 16 },
  contentInput: { fontSize: 16, color: COLORS.gray800, lineHeight: 24, minHeight: 200, textAlignVertical: 'top' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  deleteButton: { fontSize: 16, color: COLORS.error },
  detailContent: { flex: 1, padding: 20 },
  detailTitle: { fontSize: 28, fontWeight: '700', color: COLORS.gray800, marginBottom: 12 },
  detailDate: { fontSize: 14, color: COLORS.gray400, marginBottom: 24 },
  detailBody: { fontSize: 16, color: COLORS.gray700, lineHeight: 26 },
  imageUploadButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  imageUploadText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  urlInputContainer: { backgroundColor: COLORS.gray50, borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 16, borderWidth: 1, borderColor: COLORS.gray200 },
  urlInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.gray800, marginBottom: 10 },
  urlProcessButton: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  urlProcessButtonDisabled: { backgroundColor: COLORS.gray300 },
  urlProcessButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  detailTitleInput: { fontSize: 28, fontWeight: '700', color: COLORS.gray800, marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  detailContentInput: { fontSize: 16, color: COLORS.gray800, lineHeight: 24, minHeight: 300, textAlignVertical: 'top', paddingTop: 8 },
  imagePreview: { marginBottom: 16, alignItems: 'center' },
  previewImage: { width: 200, height: 150, borderRadius: 8, marginBottom: 8 },
  imageInfo: { fontSize: 12, color: COLORS.gray500, fontStyle: 'italic' },
});

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NotesList" component={NotesListScreen} />
        <Stack.Screen name="AddNote" component={AddNoteScreen} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
