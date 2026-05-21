import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

export class ConnectionController {
  async createFromOffer(offerId: string) {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM connections WHERE source_id = ?', offerId);
    if (existing) return;

    const offer = await db.get(
      `SELECT o.from_user_id, o.to_user_id, l.title
       FROM offers o JOIN listings l ON o.listing_id = l.id
       WHERE o.id = ?`,
      offerId
    );
    if (!offer) return;

    await db.run(
      `INSERT INTO connections (id, user1_id, user2_id, skill_title, source_type, source_id)
       VALUES (?, ?, ?, ?, 'offer', ?)`,
      [randomUUID(), offer.from_user_id, offer.to_user_id, offer.title, offerId]
    );
  }

  async createFromSwap(swapId: string) {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM connections WHERE source_id = ?', swapId);
    if (existing) return;

    const swap = await db.get(
      `SELECT sw.requester_id, sw.responder_id, sw.wanted_skill_id,
              l.title AS listing_title,
              ws.name AS wanted_skill_name
       FROM swaps sw
       JOIN listings l ON sw.target_skill_id = l.id
       LEFT JOIN skills ws ON sw.wanted_skill_id = ws.id
       WHERE sw.id = ?`,
      swapId
    );
    if (!swap) return;

    // Connection 1: teacher (requester) teaches the requested skill to the listing owner (responder)
    await db.run(
      `INSERT INTO connections (id, user1_id, user2_id, skill_title, source_type, source_id)
       VALUES (?, ?, ?, ?, 'swap', ?)`,
      [randomUUID(), swap.requester_id, swap.responder_id, swap.listing_title, swapId]
    );

    // Connection 2 (bidirectional): listing owner teaches their skill to the teacher
    if (swap.wanted_skill_id && swap.wanted_skill_name) {
      await db.run(
        `INSERT INTO connections (id, user1_id, user2_id, skill_title, source_type, source_id)
         VALUES (?, ?, ?, ?, 'swap', ?)`,
        [randomUUID(), swap.responder_id, swap.requester_id, swap.wanted_skill_name, swapId]
      );
    }
  }

  async getForUser(userId: string) {
    const db = await getDb();
    const rows = await db.all(
      `SELECT c.id, c.skill_title, c.source_type, c.created_at,
              u.id AS other_id, u.name AS other_name, u.avatar AS other_avatar
       FROM connections c
       JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
       WHERE (c.user1_id = ? OR c.user2_id = ?) AND c.status = 'awaiting_schedule'
       ORDER BY c.created_at DESC`,
      [userId, userId, userId]
    );

    return rows.map((row: any) => ({
      id: row.id,
      skillTitle: row.skill_title,
      sourceType: row.source_type,
      createdAt: row.created_at,
      otherUser: {
        id: row.other_id,
        name: row.other_name,
        avatar: row.other_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.other_name)}&background=7c3aed&color=fff`,
      },
    }));
  }

  async dismiss(connectionId: string, userId: string) {
    const db = await getDb();
    await db.run(
      "UPDATE connections SET status = 'dismissed' WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
      [connectionId, userId, userId]
    );
  }
}

export default new ConnectionController();
