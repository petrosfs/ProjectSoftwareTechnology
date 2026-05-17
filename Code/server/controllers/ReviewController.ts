// UC-REV-02: Skill Teaching Review
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

const FLAGGED_WORDS = ['spam', 'fake', 'scam', 'hate', 'abuse'];

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

  // UC-REV-02: verify session is completed and reviewer has not already reviewed it
  async checkPermission(sessionId: string, reviewerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const db = await getDb();

    const session = await db.get('SELECT id, status FROM sessions WHERE id = ?', sessionId);
    if (!session) return { allowed: false, reason: 'sessionNotFound' };
    if (session.status !== 'completed') return { allowed: false, reason: 'sessionNotCompleted' };

    const existing = await db.get(
      'SELECT id FROM reviews WHERE session_id = ? AND from_user_id = ?',
      [sessionId, reviewerId]
    );
    if (existing) return { allowed: false, reason: 'reviewAlreadyExists' };

    return { allowed: true };
  }

  // UC-REV-02: check comment for inappropriate content
  checkContent(comment: string): boolean {
    const lower = comment.toLowerCase();
    return !FLAGGED_WORDS.some(w => lower.includes(w));
  }

  // UC-REV-02: submit a review and update reviewee's aggregate rating
  async submitReview(data: {
    sessionId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    skillTitle?: string;
  }) {
    const permission = await this.checkPermission(data.sessionId, data.reviewerId);
    if (!permission.allowed) {
      throw Object.assign(new Error(permission.reason ?? 'Permission denied'), { status: 403 });
    }

    if (!this.checkContent(data.comment)) {
      throw Object.assign(new Error('Comment contains inappropriate content'), { status: 422 });
    }

    const db = await getDb();
    const id = randomUUID();
    await db.run(
      `INSERT INTO reviews (id, session_id, from_user_id, to_user_id, rating, comment, skill_title)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.sessionId, data.reviewerId, data.revieweeId, data.rating, data.comment, data.skillTitle ?? null]
    );

    // recalculate aggregate rating for reviewee
    const agg = await db.get(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE to_user_id = ?',
      data.revieweeId
    );
    await db.run(
      'UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?',
      [Number(agg.avg_rating.toFixed(2)), agg.cnt, data.revieweeId]
    );

    return { id, rating: data.rating };
  }
}

export default new ReviewController();
