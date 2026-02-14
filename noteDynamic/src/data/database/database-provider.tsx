import React, { createContext, useContext, useEffect, useState } from 'react';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { appSchema } from './schema';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';
import { NoteTag } from '../models/NoteTag';
import { NoteRepository } from '../repositories/NoteRepository';
import { SyncEngine } from '../sync/sync-engine';

// Define model classes for WatermelonDB
const modelClasses = [
  { tableName: 'notes', modelClass: Note },
  { tableName: 'tags', modelClass: Tag },
  { tableName: 'note_tags', modelClass: NoteTag },
];

interface DatabaseContextType {
  database: Database | null;
  repository: NoteRepository | null;
  syncEngine: SyncEngine | null;
  isInitialized: boolean;
  initialize: (userId: string) => Promise<void>;
  reset: () => void;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
  repository: null,
  syncEngine: null,
  isInitialized: false,
  initialize: async () => {},
  reset: () => {},
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [database, setDatabase] = useState<Database | null>(null);
  const [repository, setRepository] = useState<NoteRepository | null>(null);
  const [syncEngine, setSyncEngine] = useState<SyncEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = async (userId: string) => {
    try {
      // Create SQLite adapter
      const adapter = new SQLiteAdapter({
        schema: appSchema,
        migrations: [], // Add migrations here when needed
        jsi: true, // Enable JSI for better performance
        onSetUpError: (error) => {
          console.error('Database setup error:', error);
        },
      });

      // Create database instance
      const db = new Database({
        adapter,
        modelClasses: [Note, Tag, NoteTag],
      });

      // Create repository
      const repo = new NoteRepository(db);

      // Create sync engine
      const sync = new SyncEngine(db, userId);

      // Start sync
      await sync.startSync();

      setDatabase(db);
      setRepository(repo);
      setSyncEngine(sync);
      setIsInitialized(true);

      console.log('[DatabaseProvider] Database initialized for user:', userId);
    } catch (error) {
      console.error('[DatabaseProvider] Failed to initialize database:', error);
      throw error;
    }
  };

  const reset = () => {
    // Stop sync
    syncEngine?.stopSync();

    setDatabase(null);
    setRepository(null);
    setSyncEngine(null);
    setIsInitialized(false);
  };

  return (
    <DatabaseContext.Provider
      value={{
        database,
        repository,
        syncEngine,
        isInitialized,
        initialize,
        reset,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
