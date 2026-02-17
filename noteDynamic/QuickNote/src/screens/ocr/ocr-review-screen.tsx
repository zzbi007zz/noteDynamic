import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors } from '../../theme';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card } from '../../components/card';

import { useNoteStore } from '../../store/note-store';
import { useAuthStore } from '../../store/auth-store';
import { OCRResult } from '../../services/ocr-service';

// Define params type for the route
type OCRReviewParams = {
  imageUri: string;
  ocrResult: OCRResult;
  sourceUrl?: string;
};

type OCRReviewRouteProp = RouteProp<
  { OCRReview: OCRReviewParams },
  'OCRReview'
>;

type OCRReviewNavigationProp = NativeStackNavigationProp<any>;

export const OCRReviewScreen: React.FC = () => {
  const navigation = useNavigation<OCRReviewNavigationProp>();
  const route = useRoute<OCRReviewRouteProp>();
  const { imageUri, ocrResult, sourceUrl } = route.params;

  const { user } = useAuthStore();
  const { createNote, isLoading } = useNoteStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(ocrResult.text);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(true);

  // Extract keywords for suggested tags
  useEffect(() => {
    if (ocrResult.text) {
      const keywords = extractKeywords(ocrResult.text, 3);
      setTags(keywords);
    }
  }, [ocrResult.text]);

  const extractKeywords = (text: string, max: number): string[] => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !isStopWord(w));

    const freq: { [key: string]: number } = {};
    words.forEach(w => {
      freq[w] = (freq[w] || 0) + 1;
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([word]) => word);
  };

  const isStopWord = (word: string): boolean => {
    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'they', 'them', 'their', 'there', 'when',
      'where', 'what', 'which', 'while', 'have', 'been', 'were', 'said', 'time',
      'than', 'them', 'into', 'just', 'like', 'over', 'also', 'back', 'only',
      'know', 'take', 'year', 'good', 'come', 'could', 'make', 'well', 'work',
      'first', 'very', 'even', 'want', 'here', 'look', 'down', 'most', 'long',
      'find', 'give', 'does', 'made', 'part', 'such', 'keep', 'call', 'came',
      'need', 'feel', 'seem', 'turn', 'hand', 'high', 'sure', 'upon', 'head',
      'help', 'home', 'side', 'move', 'both', 'five', 'once', 'same', 'each',
      'done', 'open', 'case', 'show', 'live', 'play', 'went', 'told', 'seen',
      'took', 'next', 'life', 'mind', 'word', 'text', 'note', 'page', 'line',
    ]);
    return stopWords.has(word);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the note');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for the note');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save notes');
      return;
    }

    try {
      // Save the note
      // Note: In a real implementation, you would also save the image
      // to Firebase Storage and store the URL in the note
      const newNote = await createNote({
        title: title.trim(),
        content: content.trim(),
        tags,
        userId: user.id,
        sourceUrl: sourceUrl,
        sourceScreenshotPath: imageUri,
      });

      if (newNote) {
        Alert.alert(
          'Success',
          'Note saved successfully!',
          [
            {
              text: 'View Note',
              onPress: () => {
                // Navigate to note detail
                navigation.navigate('Notes', { noteId: newNote.id });
              },
            },
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to create note');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save note';
      Alert.alert('Error', message);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleDiscard}
          style={styles.headerButton}
        >
          <Icon name="close" size={24} color={colors.gray600} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Review Note</Text>

        <Button
          title="Save"
          onPress={handleSave}
          loading={isLoading}
          variant="primary"
          size="small"
          style={styles.saveButton}
        />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Image Preview */}
        {showImagePreview && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              style={styles.closeImageButton}
              onPress={() => setShowImagePreview(false)}
            >
              <Icon name="close-circle" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {!showImagePreview && (
          <TouchableOpacity
            style={styles.showImageButton}
            onPress={() => setShowImagePreview(true)}
          >
            <Icon name="image" size={20} color={colors.primary} />
            <Text style={styles.showImageText}>Show Image</Text>
          </TouchableOpacity>
        )}

        {/* Title Input */}
        <Input
          label="Title"
          placeholder="Enter note title..."
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.input}
        />

        {/* Content Input */}
        <View style={styles.contentInputContainer}>
          <Text style={styles.inputLabel}>Content</Text>
          <ScrollView
            style={styles.contentScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <Input
              placeholder="Note content (extracted from image)..."
              value={content}
              onChangeText={setContent}
              multiline={true}
              numberOfLines={10}
              textAlignVertical="top"
              inputStyle={styles.contentInput}
            />
          </ScrollView>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.inputLabel}>Tags</Text>

          <View style={styles.tagInputContainer}>
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              containerStyle={styles.tagInput}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
            >
              <Icon name="plus" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Tags List */}
          <View style={styles.tagsList}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Icon name="close" size={14} color={colors.gray500} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  saveButton: {
    minWidth: 80,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  closeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  showImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    gap: 8,
  },
  showImageText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  input: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  contentInputContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 6,
  },
  contentScroll: {
    maxHeight: 250,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  contentInput: {
    minHeight: 200,
    paddingTop: 12,
  },
  tagsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
