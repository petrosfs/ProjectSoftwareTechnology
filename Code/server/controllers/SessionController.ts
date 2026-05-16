import { getDb } from '../db/database.js';

export class SessionController {
  async getSessionsForUser(userId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT
        s.id, s.skill_title, s.scheduled_at, s.status,
        CASE WHEN s.teacher_id = ? THEN 'teaching' ELSE 'learning' END AS type,
        CASE WHEN s.teacher_id = ? THEN u_l.name  ELSE u_t.name  END AS other_user,
        CASE WHEN s.teacher_id = ? THEN u_l.avatar ELSE u_t.avatar END AS other_user_avatar
      FROM sessions s
      JOIN users u_t ON s.teacher_id = u_t.id
      JOIN users u_l ON s.learner_id  = u_l.id
      WHERE s.teacher_id = ? OR s.learner_id = ?
      ORDER BY s.scheduled_at ASC
    `, [userId, userId, userId, userId, userId]);

    return rows.map((row: any) => {
      const [date, timePart] = String(row.scheduled_at).split('T');
      return {
        id: row.id,
        skillTitle: row.skill_title,
        date,
        time: timePart?.slice(0, 5) ?? '',
        status: row.status,
        type: row.type,
        otherUser: row.other_user,
        otherUserAvatar: row.other_user_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.other_user)}&background=7c3aed&color=fff`,
      };
    });
  }
}

export default new SessionController();
