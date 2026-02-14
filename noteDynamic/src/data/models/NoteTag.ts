import { Model, field, relation, date } from '@nozbe/watermelondb/decorators';

export class NoteTag extends Model {
  static table = 'note_tags';

  @field('note_id') noteId!: string;
  @field('tag_id') tagId!: string;
  @date('created_at') createdAt!: number;

  // Relations
  @relation('notes', 'note_id') note!: any;
  @relation('tags', 'tag_id') tag!: any;
}
