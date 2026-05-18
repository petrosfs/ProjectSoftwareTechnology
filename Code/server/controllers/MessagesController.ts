import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

export class MessagesController {
  async getConversations(userId: string) {
    const db = await getDb();
    const rows = await db.all(
      `SELECT
         c.id,
         c.last_message_at,
         CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END AS other_id,
         u.name  AS other_name,
         u.avatar AS other_avatar,
         u.rating AS other_rating,
         (SELECT text       FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_msg,
         (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_msg_time,
         (SELECT COUNT(*)   FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread
       FROM conversations c
       JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY COALESCE(last_msg_time, c.created_at) DESC`,
      [userId, userId, userId, userId, userId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      otherUser: { id: r.other_id, name: r.other_name, avatar: r.other_avatar ?? null, rating: r.other_rating ?? 0 },
      lastMessage: r.last_msg ?? '',
      lastMessageTime: r.last_msg_time ?? null,
      unreadCount: r.unread,
    }));
  }

  async getMessages(conversationId: string, userId: string) {
    const db = await getDb();
    const conv = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );
    if (!conv) throw Object.assign(new Error('Not found'), { status: 404 });

    const rows = await db.all(
      'SELECT id, sender_id, text, is_read, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      conversationId
    );
    return rows.map((r: any) => ({
      id: r.id,
      senderId: r.sender_id,
      text: r.text,
      isMe: r.sender_id === userId,
      isRead: !!r.is_read,
      createdAt: r.created_at,
    }));
  }

  private async findOrCreateConversation(user1Id: string, user2Id: string): Promise<string> {
    const db = await getDb();
    const existing = await db.get(
      `SELECT id FROM conversations
       WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
      [user1Id, user2Id, user2Id, user1Id]
    );
    if (existing) return existing.id;
    const id = randomUUID();
    await db.run(
      'INSERT INTO conversations (id, user1_id, user2_id) VALUES (?, ?, ?)',
      [id, user1Id, user2Id]
    );
    return id;
  }

  async sendMessage(senderId: string, receiverId: string, text: string) {
    if (!text?.trim()) throw Object.assign(new Error('Message cannot be empty'), { status: 400 });
    const db = await getDb();
    const convId = await this.findOrCreateConversation(senderId, receiverId);
    const id = randomUUID();
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, convId, senderId, text.trim(), now]
    );
    await db.run('UPDATE conversations SET last_message_at = ? WHERE id = ?', [now, convId]);
    return { id, conversationId: convId, senderId, text: text.trim(), isMe: true, isRead: false, createdAt: now };
  }

  async markRead(conversationId: string, userId: string) {
    const db = await getDb();
    await db.run(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, userId]
    );
  }

  async deleteConversation(conversationId: string, userId: string) {
    const db = await getDb();
    const conv = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );
    if (!conv) throw Object.assign(new Error('Not found'), { status: 404 });
    await db.run('DELETE FROM conversations WHERE id = ?', conversationId);
  }
}

export default new MessagesController();
