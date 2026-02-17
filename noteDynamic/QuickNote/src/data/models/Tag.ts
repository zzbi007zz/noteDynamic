import { Model, field, date, readonly } from '@nozbe/watermelondb/decorators';
import { Q } from '@nozbe/watermelondb';

export class Tag extends Model {
  static table = 'tags';

  @field('name') name!: string;
  @field('color') color!: string | null;
  @field('user_id') userId!: string;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
  @date('synced_at') syncedAt!: number | null;
  @field('remote_id') remoteId!: string | null;

  /**
   * Find tag by name (case-insensitive)
   */
  static async findByName(database: any, name: string, userId: string): Promise<Tag | null> {
    const tags = await database
      .get('tags')
      .query(
        Q.where('user_id', userId),
        Q.where('name', Q.like(name.toLowerCase()))
      )
      .fetch();

    return tags[0] || null;
  }

  /**
   * Get or create a tag
   */
  static async getOrCreate(
    database: any,
    name: string,
    userId: string,
    color?: string
  ): Promise<Tag> {
    const existing = await Tag.findByName(database, name, userId);
    if (existing) return existing;

    return database.write(async () => {
      return database.get('tags').create((tag: Tag) => {
        tag.name = name.toLowerCase().trim();
        tag.color = color || null;
        tag.userId = userId;
        tag.createdAt = Date.now();
        tag.updatedAt = Date.now();
        tag.syncedAt = null;
        tag.remoteId = null;
      });
    });
  }

  /**
   * Update tag
   */
  async updateTag(updates: { name?: string; color?: string }): Promise<void> {
    await this.update((tag: Tag) => {
      if (updates.name !== undefined) {
        tag.name = updates.name.toLowerCase().trim();
      }
      if (updates.color !== undefined) {
        tag.color = updates.color;
      }
      tag.updatedAt = Date.now();
    });
  }

  /**
   * Mark as synced
   */
  async markAsSynced(remoteId?: string): Promise<void> {
    await this.update((tag: Tag) => {
      tag.syncedAt = Date.now();
      if (remoteId) {
        tag.remoteId = remoteId;
      }
    });
  }
}
