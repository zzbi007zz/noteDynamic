import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { Card } from '../../components/card';

// Mock data for notes
const mockNotes = [
  {
    id: '1',
    title: 'Shopping List',
    content: 'Milk, eggs, bread, butter, coffee...',
    updatedAt: new Date().toISOString(),
    tags: ['personal', 'shopping'],
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Discussed project timeline and deliverables...',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['work', 'meeting'],
  },
];

export const NotesScreen: React.FC = () => {
  const theme = useTheme();

  const renderNoteItem = ({ item }: { item: typeof mockNotes[0] }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card
        title={item.title}
        subtitle={formatDate(item.updatedAt)}
        style={styles.noteCard}
        contentStyle={styles.noteCardContent}
      >
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Notes</Text>
          <Text style={styles.headerSubtitle}>
            {mockNotes.length} notes
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={24} color={colors.gray600} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon
              name="note-text-outline"
              size={64}
              color={colors.gray300}
            />
            <Text style={styles.emptyStateTitle}>No notes yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Tap the + button to create your first note
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // Navigate to create note screen
        }}
        color={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray800,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88, // Space for FAB
  },
  noteCard: {
    marginBottom: 12,
  },
  noteCardContent: {
    paddingTop: 0,
  },
  noteContent: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
