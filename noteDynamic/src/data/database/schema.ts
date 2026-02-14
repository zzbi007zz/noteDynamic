import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Note table schema
export const noteSchema = tableSchema({
  name: 'notes',
  columns: [
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'tags', type: 'string' }, // JSON array of tag names
    { name: 'source_url', type: 'string', isOptional: true },
    { name: 'source_screenshot_path', type: 'string', isOptional: true },
    { name: 'is_archived', type: 'boolean' },
    { name: 'is_deleted', type: 'boolean' },
    { name: 'user_id', type: 'string' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
    { name: 'synced_at', type: 'number', isOptional: true },
    { name: 'remote_id', type: 'string', isOptional: true },
  ],
});

// Tag table schema (for efficient tag management)
export const tagSchema = tableSchema({
  name: 'tags',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'color', type: 'string', isOptional: true },
    { name: 'user_id', type: 'string' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
    { name: 'synced_at', type: 'number', isOptional: true },
    { name: 'remote_id', type: 'string', isOptional: true },
  ],
});

// NoteTag junction table for many-to-many relationship
export const noteTagSchema = tableSchema({
  name: 'note_tags',
  columns: [
    { name: 'note_id', type: 'string' },
    { name: 'tag_id', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
});

// Application schema
export const appSchema = appSchema({
  version: 1,
  tables: [noteSchema, tagSchema, noteTagSchema],
});
