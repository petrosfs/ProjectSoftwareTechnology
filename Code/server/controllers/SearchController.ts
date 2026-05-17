// UC-SRC-02: Search Skill
import { getDb } from '../db/database.js';

export class SearchController {
  // UC-SRC-02: search listings by keyword across title, description and category
  async initiateSearch(keyword: string) {
    const db = await getDb();
    const like = `%${keyword.trim()}%`;
    const rows = await db.all(`
      SELECT l.id, l.title, l.description, l.category, l.price,
             l.swap_available, l.type, l.delivery_mode, l.created_at, l.user_id,
             u.name AS user_name, u.avatar AS user_avatar, u.rating AS user_rating
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.title LIKE ? OR l.description LIKE ? OR l.category LIKE ?
      ORDER BY l.created_at DESC
    `, [like, like, like]);
    return rows.map(this.mapRow);
  }

  // UC-SRC-02: get full details for a single listing/skill
  async getSkillDetails(skillId: string) {
    const db = await getDb();
    const row = await db.get(`
      SELECT l.id, l.title, l.description, l.category, l.price,
             l.swap_available, l.type, l.delivery_mode, l.created_at, l.user_id,
             u.name AS user_name, u.avatar AS user_avatar, u.rating AS user_rating
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, skillId);
    return row ? this.mapRow(row) : null;
  }

  // UC-SRC-02: return top suggestions for autocomplete
  async getSuggestions(keyword: string) {
    const results = await this.initiateSearch(keyword);
    return results.slice(0, 5).map(r => ({ id: r.id, title: r.title, category: r.category }));
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: row.price,
      swapAvailable: !!row.swap_available,
      type: row.type,
      deliveryMode: row.delivery_mode,
      createdAt: row.created_at,
      userId: row.user_id,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      userRating: row.user_rating,
    };
  }
}

export default new SearchController();
