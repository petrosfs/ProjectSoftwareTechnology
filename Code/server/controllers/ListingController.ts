import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

export class ListingController {
  async getListings() {
    const db = await getDb();
    const rows = await db.all(`
      SELECT l.id, l.title, l.description, l.category, l.price,
             l.swap_available, l.type, l.delivery_mode, l.created_at, l.user_id,
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
             l.swap_available, l.type, l.delivery_mode, l.created_at, l.user_id,
             u.name AS user_name, u.avatar AS user_avatar, u.rating AS user_rating
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, id);
    return row ? this.mapRow(row) : null;
  }

  // UC-REQ-02 & UC-PST-02: create a new listing (type = 'request' | 'offer')
  async saveListing(data: {
    userId: string;
    title: string;
    description: string;
    category: string;
    price?: number | null;
    swapAvailable?: boolean;
    type: 'offer' | 'request';
    deliveryMode?: string;
  }) {
    if (!data.title?.trim() || !data.description?.trim() || !data.category?.trim()) {
      throw Object.assign(new Error('Missing required fields'), { status: 400 });
    }

    const db = await getDb();
    const id = randomUUID();
    await db.run(
      `INSERT INTO listings (id, user_id, title, description, category, price, swap_available, type, delivery_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.title.trim(),
        data.description.trim(),
        data.category.trim(),
        data.price ?? null,
        data.swapAvailable ? 1 : 0,
        data.type,
        data.deliveryMode ?? 'online',
      ]
    );
    return this.getListing(id);
  }

  async deleteListing(id: string, userId: string) {
    const db = await getDb();
    const listing = await db.get('SELECT id, user_id FROM listings WHERE id = ?', id);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (listing.user_id !== userId) throw Object.assign(new Error('Not authorized'), { status: 403 });
    await db.run('DELETE FROM listings WHERE id = ?', id);
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
      userRating: row.user_rating ?? 0,
    };
  }
}

export default new ListingController();
