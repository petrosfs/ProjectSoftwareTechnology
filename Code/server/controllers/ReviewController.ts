import { getDb } from '../db/database.js';

export class ReviewController {
  async getReviews(userId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT r.id, r.rating, r.comment, r.skill_title, r.created_at,
             u.name AS from_user_name, u.avatar AS from_user_avatar
      FROM reviews r
      JOIN users u ON r.from_user_id = u.id
      WHERE r.to_user_id = ?
      ORDER BY r.created_at DESC
    `, userId);

    return rows.map((row: any) => ({
      id: row.id,
      fromUser: row.from_user_name,
      fromUserAvatar: row.from_user_avatar
        ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.from_user_name)}&background=7c3aed&color=fff`,
      rating: row.rating,
      comment: row.comment,
      skillTitle: row.skill_title,
      date: String(row.created_at).split('T')[0],
    }));
  }
}

export default new ReviewController();
