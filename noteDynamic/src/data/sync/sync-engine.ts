import { Database, Q } from '@nozbe/watermelondb';
import { Note } from '../models/Note';
import { firestoreDb } from '../../services/firebase';
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  Timestamp,
  query,
  where,
  orderBy,
  DocumentData,
  QuerySnapshot,
  getDocs,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncChange {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;
  userId: string;
}

export class SyncEngine {
  private unsubscribeFirestore: (() => void) | null = null;
  private lastSyncTimestamp: number = 0;
  private syncQueue: SyncChange[] = [];
  private isSyncing: boolean = false;
  private syncEnabled: boolean = true;

  constructor(
    private database: Database,
    private userId: string
  ) {}

  /**
   * Enable/disable sync
   */
  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }

  /**
   * Start bidirectional sync
   */
  async startSync(): Promise<void> {
    if (!this.syncEnabled) {
      console.log('[SyncEngine] Sync is disabled');
      return;
    }

    console.log('[SyncEngine] Starting sync...');

    // 1. Load local pending changes
    await this.loadPendingChanges();

    // 2. Push local changes to Firestore
    await this.pushToFirestore();

    // 3. Listen to Firestore changes
    this.subscribeToFirestore();

    console.log('[SyncEngine] Sync started successfully');
  }

  /**
   * Stop sync
   */
  stopSync(): void {
    console.log('[SyncEngine] Stopping sync...');
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
  }

  /**
   * Load pending changes from local sync queue
   */
  private async loadPendingChanges(): Promise<void> {
    try {
      const storedQueue = await AsyncStorage.getItem(
        `syncQueue_${this.userId}`
      );
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
        console.log(
          `[SyncEngine] Loaded ${this.syncQueue.length} pending changes`
        );
      }
    } catch (error) {
      console.error('[SyncEngine] Failed to load pending changes:', error);
    }
  }

  /**
   * Push local changes to Firestore
   */
  private async pushToFirestore(): Promise<void> {
    if (this.syncQueue.length === 0) return;
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log(
      `[SyncEngine] Pushing ${this.syncQueue.length} changes to Firestore...`
    );

    try {
      const batch = writeBatch(firestoreDb);
      const changesToPush = [...this.syncQueue];

      for (const change of changesToPush) {
        const docRef = doc(
          firestoreDb,
          'users',
          this.userId,
          'changes',
          change.id
        );

        batch.set(docRef, {
          ...change,
          syncedAt: Timestamp.now(),
        });
      }

      await batch.commit();

      // Remove successfully pushed changes from queue
      this.syncQueue = this.syncQueue.filter(
        (change) => !changesToPush.find((c) => c.id === change.id)
      );

      await this.persistQueue();

      console.log('[SyncEngine] Successfully pushed changes to Firestore');
    } catch (error) {
      console.error('[SyncEngine] Failed to push to Firestore:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Subscribe to Firestore changes
   */
  private subscribeToFirestore(): void {
    console.log('[SyncEngine] Subscribing to Firestore changes...');

    const notesQuery = query(
      collection(firestoreDb, 'users', this.userId, 'notes'),
      orderBy('updatedAt', 'desc')
    );

    this.unsubscribeFirestore = onSnapshot(
      notesQuery,
      async (snapshot) => {
        await this.handleFirestoreChanges(snapshot);
      },
      (error) => {
        console.error('[SyncEngine] Firestore subscription error:', error);
      }
    );
  }

  /**
   * Handle Firestore changes
   */
  private async handleFirestoreChanges(
    snapshot: QuerySnapshot<DocumentData>
  ): Promise<void> {
    const changes = snapshot.docChanges();

    if (changes.length === 0) return;

    console.log(
      `[SyncEngine] Received ${changes.length} changes from Firestore`
    );

    for (const change of changes) {
      const data = change.doc.data();
      const noteId = change.doc.id;

      // Skip if this change originated locally
      if (await this.isLocalChange(noteId)) {
        continue;
      }

      try {
        if (change.type === 'added' || change.type === 'modified') {
          await this.applyRemoteNoteChange(noteId, data);
        } else if (change.type === 'removed') {
          await this.deleteLocalNote(noteId);
        }
      } catch (error) {
        console.error('[SyncEngine] Failed to apply remote change:', error);
      }
    }
  }

  /**
   * Check if a change originated locally
   */
  private async isLocalChange(noteId: string): Promise<boolean> {
    // Check if this change is in our sync queue
    return this.syncQueue.some(
      (change) => change.table === 'notes' && change.data.id === noteId
    );
  }

  /**
   * Apply remote note change to WatermelonDB
   */
  private async applyRemoteNoteChange(
    noteId: string,
    data: DocumentData
  ): Promise<void> {
    await this.database.write(async () => {
      const notesCollection = this.database.get<Note>('notes');

      // Check if note already exists locally
      const existingNotes = await notesCollection
        .query(Q.where('remote_id', noteId))
        .fetch();

      if (existingNotes.length > 0) {
        // Update existing note
        const note = existingNotes[0];
        await note.update((n: Note) => {
          n.title = data.title ?? n.title;
          n.content = data.content ?? n.content;
          if (data.tags) n.setTags(data.tags);
          n.sourceUrl = data.sourceUrl ?? n.sourceUrl;
          n.isArchived = data.isArchived ?? n.isArchived;
          n.isDeleted = data.isDeleted ?? n.isDeleted;
          n.updatedAt = data.updatedAt?.toMillis() ?? Date.now();
        });
      } else {
        // Create new note
        await notesCollection.create((note: Note) => {
          note.title = data.title || '';
          note.content = data.content || '';
          note.setTags(data.tags || []);
          note.sourceUrl = data.sourceUrl || null;
          note.sourceScreenshotPath = null;
          note.isArchived = data.isArchived || false;
          note.isDeleted = data.isDeleted || false;
          note.userId = data.userId;
          note.createdAt = data.createdAt?.toMillis() ?? Date.now();
          note.updatedAt = data.updatedAt?.toMillis() ?? Date.now();
          note.syncedAt = Date.now();
          note.remoteId = noteId;
        });
      }
    });
  }

  /**
   * Delete local note
   */
  private async deleteLocalNote(noteId: string): Promise<void> {
    await this.database.write(async () => {
      const notes = await this.database
        .get<Note>('notes')
        .query(Q.where('remote_id', noteId))
        .fetch();

      for (const note of notes) {
        await note.destroyPermanently();
      }
    });
  }

  /**
   * Queue a local change for sync
   */
  async queueChange(change: SyncChange): Promise<void> {
    this.syncQueue.push(change);
    await this.persistQueue();

    // Attempt immediate sync if online
    if (this.syncEnabled && !this.isSyncing) {
      await this.pushToFirestore();
    }
  }

  /**
   * Persist queue to AsyncStorage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `syncQueue_${this.userId}`,
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error('[SyncEngine] Failed to persist queue:', error);
    }
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isSyncing: boolean;
    pendingChanges: number;
    syncEnabled: boolean;
  } {
    return {
      isSyncing: this.isSyncing,
      pendingChanges: this.syncQueue.length,
      syncEnabled: this.syncEnabled,
    };
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    if (!this.syncEnabled) {
      throw new Error('Sync is disabled');
    }
    await this.pushToFirestore();
  }
}
