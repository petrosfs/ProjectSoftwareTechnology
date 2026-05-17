// UC-SCH-02: Schedule Teaching Session + existing session retrieval
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

export class SessionController {
  async getSessionsForUser(userId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT
        s.id, s.skill_title, s.scheduled_at, s.status, s.duration_minutes, s.delivery_mode,
        CASE WHEN s.teacher_id = ? THEN 'teaching' ELSE 'learning' END AS type,
        CASE WHEN s.teacher_id = ? THEN u_l.name   ELSE u_t.name   END AS other_user,
        CASE WHEN s.teacher_id = ? THEN u_l.avatar  ELSE u_t.avatar  END AS other_user_avatar
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
        durationMinutes: row.duration_minutes,
        deliveryMode: row.delivery_mode,
        otherUser: row.other_user,
        otherUserAvatar: row.other_user_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.other_user)}&background=7c3aed&color=fff`,
      };
    });
  }

  // UC-SCH-02: check for conflicting sessions at the requested time slot
  async checkAvailability(targetUserId: string, scheduledAt: string, durationMinutes = 60): Promise<boolean> {
    const db = await getDb();
    const conflict = await db.get(`
      SELECT id FROM sessions
      WHERE (teacher_id = ? OR learner_id = ?)
        AND status NOT IN ('cancelled')
        AND scheduled_at = ?
    `, [targetUserId, targetUserId, scheduledAt]);
    return !conflict;
  }

  // UC-SCH-02: create a new session with status=pending (awaiting ActorB approval)
  async scheduleSession(data: {
    teacherId: string;
    learnerId: string;
    skillTitle: string;
    scheduledAt: string;
    durationMinutes?: number;
    deliveryMode?: string;
    listingId?: string;
  }) {
    if (!data.teacherId || !data.learnerId || !data.skillTitle || !data.scheduledAt) {
      throw Object.assign(new Error('Missing required session fields'), { status: 400 });
    }

    const available = await this.checkAvailability(data.learnerId, data.scheduledAt);
    if (!available) {
      throw Object.assign(new Error('Time slot not available for target user'), { status: 409 });
    }

    const db = await getDb();
    const id = randomUUID();
    await db.run(
      `INSERT INTO sessions (id, listing_id, teacher_id, learner_id, skill_title, scheduled_at, duration_minutes, delivery_mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        data.listingId ?? null,
        data.teacherId,
        data.learnerId,
        data.skillTitle,
        data.scheduledAt,
        data.durationMinutes ?? 60,
        data.deliveryMode ?? 'online',
      ]
    );
    return { id, status: 'pending', ...data };
  }

  // UC-SCH-02: ActorB accepts or rejects a session proposal
  async handleResponse(sessionId: string, userId: string, response: 'accepted' | 'rejected') {
    const db = await getDb();
    const session = await db.get(
      'SELECT id, learner_id, status FROM sessions WHERE id = ?',
      sessionId
    );
    if (!session) {
      throw Object.assign(new Error('Session not found'), { status: 404 });
    }
    if (session.learner_id !== userId) {
      throw Object.assign(new Error('Not authorized to respond to this session'), { status: 403 });
    }

    const newStatus = response === 'accepted' ? 'confirmed' : 'cancelled';
    await db.run('UPDATE sessions SET status = ? WHERE id = ?', [newStatus, sessionId]);
    return { id: sessionId, status: newStatus };
  }
}

export default new SessionController();
