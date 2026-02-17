import { Database, Q } from '@nozbe/watermelondb';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  sourceUrl?: string;
  sourceScreenshotPath?: string;
  userId: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  sourceUrl?: string;
  sourceScreenshotPath?: string;
}

export interface SearchNotesFilters {
  query?: string;
  tags?: string[];
  archived?: boolean;
  deleted?: boolean;
}

export class NoteRepository {
  constructor(private database: Database) {}

  /**
   * Get all notes for a user with optional filtering
   */
  async getNotes(
    userId: string,
    filters: SearchNotesFilters = {}
  ): Promise<Note[]> {
    const { query, tags, archived = false, deleted = false } = filters;

    const conditions: any[] = [
      Q.where('user_id', userId),
      Q.where('is_archived', archived),
      Q.where('is_deleted', deleted),
    ];

    // Search query filter
    if (query) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(
        Q.or(
          Q.where('title', Q.like(searchTerm)),
          Q.where('content', Q.like(searchTerm))
        )
      );
    }

    // Tag filter (notes containing any of the specified tags)
    if (tags && tags.length > 0) {
      // This is a simplified approach - for exact tag matching,
      // you'd need a more complex query or post-filtering
      const tagConditions = tags.map(tag =>
        Q.where('tags', Q.like(`%${tag}%`))
      );
      conditions.push(Q.or(...tagConditions));
    }

    return this.database
      .get<Note>('notes')
      .query(...conditions, Q.sortBy('updated_at', Q.desc))
      .fetch();
  }

  /**
   * Get a single note by ID
   */
  async getNoteById(noteId: string): Promise<Note | null> {
    try {
      return await this.database.get<Note>('notes').find(noteId);
    } catch {
      return null;
    }
  }

  /**
   * Create a new note
   */
  async createNote(input: CreateNoteInput): Promise<Note> {
    const now = Date.now();
    const sanitizedTags = (input.tags || [])
      .map(t => t.toLowerCase().trim())
      .filter(Boolean);

    return this.database.write(async () => {
      return this.database.get<Note>('notes').create((note: Note) => {
        note.title = input.title;
        note.content = input.content || '';
        note.setTags(sanitizedTags);
        note.sourceUrl = input.sourceUrl || null;
        note.sourceScreenshotPath = input.sourceScreenshotPath || null;
        note.isArchived = false;
        note.isDeleted = false;
        note.userId = input.userId;
        note.createdAt = now;
        note.updatedAt = now;
        note.syncedAt = null;
        note.remoteId = null;
      });
    });
  }

  /**
   * Update an existing note
   */
  async updateNote(
    noteId: string,
    input: UpdateNoteInput
  ): Promise<Note | null> {
    const note = await this.getNoteById(noteId);
    if (!note) return null;

    return this.database.write(async () => {
      return note.update((n: Note) => {
        if (input.title !== undefined) n.title = input.title;
        if (input.content !== undefined) n.content = input.content;
        if (input.tags !== undefined) {
          n.setTags(
            input.tags.map(t => t.toLowerCase().trim()).filter(Boolean)
          );
        }
        if (input.sourceUrl !== undefined) n.sourceUrl = input.sourceUrl;
        if (input.sourceScreenshotPath !== undefined) {
          n.sourceScreenshotPath = input.sourceScreenshotPath;
        }
        n.updatedAt = Date.now();
        n.syncedAt = null; // Mark for re-sync
      });
    });
  }

  /**
   * Archive a note
   */
  async archiveNote(noteId: string): Promise<Note | null> {
    const note = await this.getNoteById(noteId);
    if (!note) return null;

    await note.archive();
    return note;
  }

  /**
   * Unarchive a note
   */
  async unarchiveNote(noteId: string): Promise<Note | null> {
    const note = await this.getNoteById(noteId);
    if (!note) return null;

    await note.unarchive();
    return note;
  }

  /**
   * Soft delete a note (move to trash)
   */
  async softDeleteNote(noteId: string): Promise<Note | null> {
    const note = await this.getNoteById(noteId);
    if (!note) return null;

    await note.softDelete();
    return note;
  }

  /**
   * Restore a note from trash
   */
  async restoreNote(noteId: string): Promise<Note | null> {
    const note = await this.getNoteById(noteId);
    if (!note) return null;

    await note.restore();
    return note;
  }

  /**
   * Permanently delete a note
   */
  async permanentlyDeleteNote(noteId: string): Promise<boolean> {
    const note = await this.getNoteById(noteId);
    if (!note) return false;

    await this.database.write(async () => {
      await note.destroyPermanently();
    });

    return true;
  }

  /**
   * Get all unique tags for a user
   */
  async getAllTags(userId: string): Promise<string[]> {
    const notes = await this.getNotes(userId);
    const tagSet = new Set<string>();

    notes.forEach(note => {
      note.getTags().forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * Search notes with full-text search
   */
  async searchNotes(
    userId: string,
    searchQuery: string,
    options: { includeArchived?: boolean; includeDeleted?: boolean } = {}
  ): Promise<Note[]> {
    const { includeArchived = false, includeDeleted = false } = options;

    return this.getNotes(userId, {
      query: searchQuery,
      archived: includeArchived,
      deleted: includeDeleted,
    });
  }

  /**
   * Get notes by tag
   */
  async getNotesByTag(
    userId: string,
    tag: string,
    options: { includeArchived?: boolean } = {}
  ): Promise<Note[]> {
    const { includeArchived = false } = options;

    return this.getNotes(userId, {
      tags: [tag],
      archived: includeArchived,
      deleted: false,
    });
  }

  /**
   * Get trash notes (soft deleted)
   */
  async getTrashedNotes(userId: string): Promise<Note[]> {
    return this.getNotes(userId, {
      deleted: true,
    });
  }

  /**
   * Get archived notes
   */
  async getArchivedNotes(userId: string): Promise<Note[]> {
    return this.getNotes(userId, {
      archived: true,
      deleted: false,
    });
  }

  /**
   * Bulk delete trashed notes older than X days
   */
  async emptyTrash(userId: string, olderThanDays: number = 30): Promise<number> {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const trashedNotes = await this.database
      .get<Note>('notes')
      .query(
        Q.where('user_id', userId),
        Q.where('is_deleted', true),
        Q.where('updated_at', Q.lt(cutoffTime))
      )
      .fetch();

    await this.database.write(async () => {
      for (const note of trashedNotes) {
        await note.destroyPermanently();
      }
    });

    return trashedNotes.length;
  }
}
