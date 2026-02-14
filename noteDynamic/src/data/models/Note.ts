import { Model, field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import { Q } from '@nozbe/watermelondb';
import { NoteTag } from './NoteTag';

export class Note extends Model {
  static table = 'notes';

  @field('title') title!: string;
  @field('content') content!: string;
  @field('tags') tags!: string; // JSON array of tag names
  @field('source_url') sourceUrl!: string | null;
  @field('source_screenshot_path') sourceScreenshotPath!: string | null;
  @field('is_archived') isArchived!: boolean;
  @field('is_deleted') isDeleted!: boolean;
  @field('user_id') userId!: string;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
  @date('synced_at') syncedAt!: number | null;
  @field('remote_id') remoteId!: string | null;

  // Relations
  @relation('note_tags', 'note_id') noteTags!: any;

  /**
   * Get parsed tags array
   */
  getTags(): string[] {
    try {
      return this.tags ? JSON.parse(this.tags) : [];
    } catch {
      return [];
    }
  }

  /**
   * Set tags from array
   */
  setTags(tags: string[]) {
    this.tags = JSON.stringify(tags);
  }

  /**
   * Add a tag
   */
  addTag(tag: string) {
    const tags = this.getTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.setTags(tags);
    }
  }

  /**
   * Remove a tag
   */
  removeTag(tag: string) {
    const tags = this.getTags().filter(t => t !== tag);
    this.setTags(tags);
  }

  /**
   * Archive note
   */
  async archive() {
    await this.update(note => {
      note.isArchived = true;
      note.updatedAt = Date.now();
    });
  }

  /**
   * Unarchive note
   */
  async unarchive() {
    await this.update(note => {
      note.isArchived = false;
      note.updatedAt = Date.now();
    });
  }

  /**
   * Soft delete
   */
  async softDelete() {
    await this.update(note => {
      note.isDeleted = true;
      note.updatedAt = Date.now();
    });
  }

  /**
   * Restore from trash
   */
  async restore() {
    await this.update(note => {
      note.isDeleted = false;
      note.updatedAt = Date.now();
    });
  }

  /**
   * Update content
   */
  async updateContent(updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) {
    await this.update(note => {
      if (updates.title !== undefined) note.title = updates.title;
      if (updates.content !== undefined) note.content = updates.content;
      if (updates.tags !== undefined) note.setTags(updates.tags);
      note.updatedAt = Date.now();
    });
  }

  /**
   * Mark as synced
   */
  async markAsSynced(remoteId?: string) {
    await this.update(note => {
      note.syncedAt = Date.now();
      if (remoteId) note.remoteId = remoteId;
    });
  }
}
