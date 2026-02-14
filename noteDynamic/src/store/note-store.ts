import { create } from 'zustand';
import { Database } from '@nozbe/watermelondb';
import { Note } from '../data/models/Note';
import { NoteRepository, CreateNoteInput, UpdateNoteInput, SearchNotesFilters } from '../data/repositories/NoteRepository';
import { SyncEngine } from '../data/sync/sync-engine';

interface NoteFilters {
  query?: string;
  tags?: string[];
  archived?: boolean;
  deleted?: boolean;
}

interface NoteState {
  // Data
  notes: Note[];
  currentNote: Note | null;
  filters: NoteFilters;
  allTags: string[];

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  setFilters: (filters: Partial<NoteFilters>) => void;
  clearFilters: () => void;

  // CRUD operations
  fetchNotes: () => Promise<void>;
  getNote: (noteId: string) => Promise<Note | null>;
  createNote: (input: CreateNoteInput) => Promise<Note | null>;
  updateNote: (noteId: string, input: UpdateNoteInput) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<boolean>;
  archiveNote: (noteId: string) => Promise<boolean>;
  unarchiveNote: (noteId: string) => Promise<boolean>;
  restoreNote: (noteId: string) => Promise<boolean>;

  // Tags
  fetchAllTags: () => Promise<void>;

  // Sync
  sync: () => Promise<void>;
  setSyncEngine: (engine: SyncEngine) => void;

  // Repository setup
  setRepository: (repo: NoteRepository) => void;
  setUserId: (userId: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  // Initial state
  notes: [],
  currentNote: null,
  filters: {},
  allTags: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  // Repository (will be set by the provider)
  setRepository: (repo: NoteRepository) => {
    // Store the repository in a way that's accessible
    (get() as any).repository = repo;
  },

  setUserId: (userId: string) => {
    (get() as any).userId = userId;
  },

  // Sync engine
  setSyncEngine: (engine: SyncEngine) => {
    (get() as any).syncEngine = engine;
  },

  getRepository(): NoteRepository {
    const repo = (get() as any).repository;
    if (!repo) {
      throw new Error('NoteRepository not initialized. Make sure to call setRepository first.');
    }
    return repo;
  },

  getUserId(): string {
    const userId = (get() as any).userId;
    if (!userId) {
      throw new Error('UserId not set. Make sure to call setUserId first.');
    }
    return userId;
  },

  getSyncEngine(): SyncEngine | null {
    return (get() as any).syncEngine || null;
  },

  // Filter actions
  setFilters: (filters: Partial<NoteFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    // Auto-fetch when filters change
    get().fetchNotes();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchNotes();
  },

  // CRUD operations
  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const repo = get().getRepository();
      const userId = get().getUserId();
      const { filters } = get();

      const searchFilters: SearchNotesFilters = {
        query: filters.query,
        tags: filters.tags,
        archived: filters.archived ?? false,
        deleted: filters.deleted ?? false,
      };

      const notes = await repo.getNotes(userId, searchFilters);
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
        isLoading: false,
      });
    }
  },

  getNote: async (noteId: string) => {
    try {
      const repo = get().getRepository();
      const note = await repo.getNoteById(noteId);
      set({ currentNote: note });
      return note;
    } catch (error) {
      console.error('Failed to get note:', error);
      return null;
    }
  },

  createNote: async (input: CreateNoteInput) => {
    set({ isLoading: true, error: null });
    try {
      const repo = get().getRepository();
      const note = await repo.createNote(input);

      // Refresh notes list
      await get().fetchNotes();
      await get().fetchAllTags();

      set({ currentNote: note, isLoading: false });
      return note;
    } catch (error) {
      console.error('Failed to create note:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create note',
        isLoading: false,
      });
      return null;
    }
  },

  updateNote: async (noteId: string, input: UpdateNoteInput) => {
    set({ isLoading: true, error: null });
    try {
      const repo = get().getRepository();
      const note = await repo.updateNote(noteId, input);

      // Refresh notes list and current note
      await get().fetchNotes();
      await get().fetchAllTags();

      if (get().currentNote?.id === noteId) {
        set({ currentNote: note });
      }

      set({ isLoading: false });
      return note;
    } catch (error) {
      console.error('Failed to update note:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update note',
        isLoading: false,
      });
      return null;
    }
  },

  deleteNote: async (noteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const repo = get().getRepository();
      const success = await repo.softDeleteNote(noteId);

      if (success) {
        await get().fetchNotes();
        if (get().currentNote?.id === noteId) {
          set({ currentNote: null });
        }
      }

      set({ isLoading: false });
      return success;
    } catch (error) {
      console.error('Failed to delete note:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete note',
        isLoading: false,
      });
      return false;
    }
  },

  archiveNote: async (noteId: string) => {
    try {
      const repo = get().getRepository();
      const success = await repo.archiveNote(noteId);
      if (success) {
        await get().fetchNotes();
      }
      return success;
    } catch (error) {
      console.error('Failed to archive note:', error);
      return false;
    }
  },

  unarchiveNote: async (noteId: string) => {
    try {
      const repo = get().getRepository();
      const success = await repo.unarchiveNote(noteId);
      if (success) {
        await get().fetchNotes();
      }
      return success;
    } catch (error) {
      console.error('Failed to unarchive note:', error);
      return false;
    }
  },

  restoreNote: async (noteId: string) => {
    try {
      const repo = get().getRepository();
      const success = await repo.restoreNote(noteId);
      if (success) {
        await get().fetchNotes();
      }
      return success;
    } catch (error) {
      console.error('Failed to restore note:', error);
      return false;
    }
  },

  // Tags
  fetchAllTags: async () => {
    try {
      const repo = get().getRepository();
      const userId = get().getUserId();
      const tags = await repo.getAllTags(userId);
      set({ allTags: tags });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  },

  // Sync
  sync: async () => {
    const syncEngine = get().getSyncEngine();
    if (!syncEngine) {
      console.warn('[NoteStore] No sync engine available');
      return;
    }

    set({ isSyncing: true });
    try {
      await syncEngine.forceSync();
      await get().fetchNotes();
    } catch (error) {
      console.error('[NoteStore] Sync failed:', error);
    } finally {
      set({ isSyncing: false });
    }
  },
}));

// Export hook for components
export { useNoteStore };
