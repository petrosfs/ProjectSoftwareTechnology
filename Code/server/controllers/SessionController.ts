import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import messagesController from './MessagesController.js';
import { createMeetingUrl } from '../services/MeetingService.js';
import paymentController from './PaymentController.js';
import { AppError, ErrorCodes as E } from '../utils/errors.js';

export class SessionController {
  async getSessionsForUser(userId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT
        s.id, s.skill_title, s.scheduled_at, s.status,
        s.duration_minutes, s.delivery_mode, s.initiated_by_id, s.meeting_url,
        CASE WHEN s.teacher_id = ? THEN 'teaching' ELSE 'learning' END AS type,
        CASE WHEN s.teacher_id = ? THEN s.learner_id  ELSE s.teacher_id  END AS other_user_id,
        CASE WHEN s.teacher_id = ? THEN u_l.name      ELSE u_t.name      END AS other_user,
        CASE WHEN s.teacher_id = ? THEN u_l.avatar    ELSE u_t.avatar    END AS other_user_avatar
      FROM sessions s
      JOIN users u_t ON s.teacher_id = u_t.id
      JOIN users u_l ON s.learner_id  = u_l.id
      WHERE (s.teacher_id = ? OR s.learner_id = ?) AND s.status != 'cancelled'
      ORDER BY s.scheduled_at ASC
    `, [userId, userId, userId, userId, userId, userId]);

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
        initiatedById: row.initiated_by_id ?? null,
        meetingUrl: row.meeting_url ?? null,
        otherUserId: row.other_user_id,
        otherUser: row.other_user,
        otherUserAvatar: row.other_user_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.other_user)}&background=7c3aed&color=fff`,
      };
    });
  }

  async checkAvailability(targetUserId: string, scheduledAt: string, _durationMinutes = 60): Promise<boolean> {
    const db = await getDb();
    const conflict = await db.get(`
      SELECT id FROM sessions
      WHERE (teacher_id = ? OR learner_id = ?)
        AND status NOT IN ('cancelled')
        AND scheduled_at = ?
    `, [targetUserId, targetUserId, scheduledAt]);
    return !conflict;
  }

  // UC-SCH-02: create a new session with status=pending and notify the other user
  async scheduleSession(data: {
    initiatedById: string;
    teacherId: string;
    learnerId: string;
    skillTitle: string;
    scheduledAt: string;
    durationMinutes?: number;
    deliveryMode?: string;
    listingId?: string;
  }) {
    if (!data.teacherId || !data.learnerId || !data.skillTitle || !data.scheduledAt) {
      throw new AppError('Missing required session fields', 400, E.SESSION_MISSING_FIELDS);
    }
    if (data.teacherId === data.learnerId) {
      throw new AppError('Cannot schedule a session with yourself', 400, E.SESSION_SELF_SCHEDULE);
    }

    const available = await this.checkAvailability(data.learnerId, data.scheduledAt);
    if (!available) {
      throw new AppError('Time slot not available for the selected user', 409, E.SESSION_SLOT_TAKEN);
    }

    const db = await getDb();
    const id = randomUUID();
    const duration = data.durationMinutes ?? 60;
    const mode = data.deliveryMode ?? 'online';
    const meetingUrl = mode === 'online' ? createMeetingUrl(data.skillTitle) : null;

    console.log('[scheduleSession] Inserting session:', { id, teacherId: data.teacherId, learnerId: data.learnerId, scheduledAt: data.scheduledAt, mode });

    await db.run(
      `INSERT INTO sessions
         (id, listing_id, teacher_id, learner_id, skill_title, scheduled_at,
          duration_minutes, delivery_mode, status, initiated_by_id, meeting_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, data.listingId ?? null, data.teacherId, data.learnerId,
       data.skillTitle, data.scheduledAt, duration, mode, data.initiatedById, meetingUrl]
    );

    // Send automated message to the other party
    const receiverId = data.initiatedById === data.teacherId ? data.learnerId : data.teacherId;
    const dateStr = data.scheduledAt.slice(0, 10);
    const timeStr = data.scheduledAt.slice(11, 16);
    try {
      await messagesController.sendMessage(
        data.initiatedById,
        receiverId,
        `Session request: "${data.skillTitle}" on ${dateStr} at ${timeStr} (${duration} min, ${mode}). Please respond in your Sessions page.`
      );
    } catch {
      // Message failure is non-fatal — session was created
    }

    return { id, status: 'pending', ...data };
  }

  // UC-SCH-02: the non-initiator accepts or rejects a pending session
  async handleResponse(sessionId: string, userId: string, response: 'accepted' | 'rejected') {
    const db = await getDb();
    const session = await db.get(
      'SELECT id, teacher_id, learner_id, initiated_by_id, status FROM sessions WHERE id = ?',
      sessionId
    );
    if (!session) throw new AppError('Session not found', 404, E.SESSION_NOT_FOUND);
    if (session.status !== 'pending') throw new AppError('Session is not pending', 400, E.SESSION_NOT_PENDING);

    const isParticipant = session.teacher_id === userId || session.learner_id === userId;
    if (!isParticipant) throw new AppError('Not authorized', 403, E.FORBIDDEN);

    // Determine initiator (default: teacher for legacy seed data)
    const initiator = session.initiated_by_id ?? session.teacher_id;
    if (userId === initiator) throw new AppError('Cannot respond to your own request', 403, E.SESSION_CANNOT_RESPOND);

    const newStatus = response === 'accepted' ? 'confirmed' : 'cancelled';
    await db.run('UPDATE sessions SET status = ? WHERE id = ?', [newStatus, sessionId]);
    return { id: sessionId, status: newStatus };
  }

  async cancelSession(sessionId: string, userId: string) {
    const db = await getDb();
    const session = await db.get(
      'SELECT id, teacher_id, learner_id, listing_id, status FROM sessions WHERE id = ?',
      sessionId
    );
    if (!session) throw new AppError('Session not found', 404, E.SESSION_NOT_FOUND);
    if (session.status !== 'pending' && session.status !== 'confirmed' && session.status !== 'upcoming') {
      throw new AppError('Session cannot be cancelled', 400, E.SESSION_CANNOT_CANCEL);
    }
    const isParticipant = session.teacher_id === userId || session.learner_id === userId;
    if (!isParticipant) throw new AppError('Not authorized', 403, E.FORBIDDEN);
    await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['cancelled', sessionId]);
    if (session.listing_id) {
      await paymentController.refundPayment(session.listing_id, session.learner_id);
    }
    return { id: sessionId, status: 'cancelled' };
  }

  async rescheduleSession(sessionId: string, userId: string, newScheduledAt: string) {
    const db = await getDb();
    const session = await db.get(
      'SELECT id, teacher_id, learner_id, status, delivery_mode, skill_title, meeting_url FROM sessions WHERE id = ?',
      sessionId
    );
    if (!session) throw new AppError('Session not found', 404, E.SESSION_NOT_FOUND);
    if (!['pending', 'confirmed', 'upcoming'].includes(session.status)) {
      throw new AppError('Session cannot be rescheduled', 400, E.SESSION_CANNOT_RESCHEDULE);
    }
    const isParticipant = session.teacher_id === userId || session.learner_id === userId;
    if (!isParticipant) throw new AppError('Not authorized', 403, E.FORBIDDEN);

    // Generate meeting URL if online session is missing one (e.g. legacy rows)
    const meetingUrl = (session.delivery_mode === 'online' && !session.meeting_url)
      ? createMeetingUrl(session.skill_title)
      : session.meeting_url;

    await db.run(
      'UPDATE sessions SET scheduled_at = ?, status = ?, initiated_by_id = ?, meeting_url = ? WHERE id = ?',
      [newScheduledAt, 'pending', userId, meetingUrl, sessionId]
    );

    // Notify the other participant
    const receiverId = session.teacher_id === userId ? session.learner_id : session.teacher_id;
    const dateStr = newScheduledAt.slice(0, 10);
    const timeStr = newScheduledAt.slice(11, 16);
    try {
      await db.run(
        `INSERT INTO notifications (id, user_id, type, reference_id, body)
         VALUES (?, ?, 'in-app', ?, ?)`,
        [randomUUID(), receiverId, sessionId,
         `Αίτημα αναπρογραμματισμού για το session "${session.skill_title}" → ${dateStr} ${timeStr}. Δείτε το Sessions.`]
      );
    } catch { /* notification failure is non-fatal */ }

    return { id: sessionId, status: 'pending', scheduledAt: newScheduledAt };
  }

  async completeSession(sessionId: string, userId: string) {
    const db = await getDb();
    const session = await db.get(
      'SELECT id, teacher_id, learner_id, listing_id, status FROM sessions WHERE id = ?',
      sessionId
    );
    if (!session) throw new AppError('Session not found', 404, E.SESSION_NOT_FOUND);
    if (!['confirmed', 'upcoming'].includes(session.status)) {
      throw new AppError('Session cannot be completed in its current state', 400, E.SESSION_CANNOT_COMPLETE);
    }
    const isParticipant = session.teacher_id === userId || session.learner_id === userId;
    if (!isParticipant) throw new AppError('Not authorized', 403, E.FORBIDDEN);
    await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['completed', sessionId]);
    if (session.listing_id) {
      await paymentController.releasePayment(session.listing_id, session.learner_id);
    }
    return { id: sessionId, status: 'completed' };
  }
}

export default new SessionController();
