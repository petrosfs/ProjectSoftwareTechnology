import { getDb } from '../db/database.js';

export class ListingController {
  async getListings() {
    const db = await getDb();
    const rows = await db.all(`
      SELECT l.id, l.title, l.description, l.category, l.price,
             l.swap_available, l.type, l.created_at, l.user_id,
             u.name AS user_name, u.avatar AS user_avatar, u.rating AS user_rating
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);
    return rows.map(this.mapRow);
  }

  async getListing(id: string) {
    const db = await getDb();
    const row = await db.get(`
      SELECT l.id, l.title, l.description, l.category, l.price,
             l.swap_available, l.type, l.created_at, l.user_id,
             u.name AS user_name, u.avatar AS user_avatar, u.rating AS user_rating
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, id);
    return row ? this.mapRow(row) : null;
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
      createdAt: row.created_at,
      userId: row.user_id,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      userRating: row.user_rating,
    };
  }
}

export default new ListingController();
