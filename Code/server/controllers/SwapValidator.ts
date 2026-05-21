// UC-SWP-02: Request Skill Swap
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import connectionController from './ConnectionController.js';

export class SwapValidator {
  // UC-SWP-02: confirm offered skill belongs to requester
  async verifyOfferedSkill(skillId: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const skill = await db.get(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );
    return !!skill;
  }

  // UC-SWP-02: detect duplicate pending swap between same pair for same target skill
  async checkDuplicateSwap(requesterId: string, responderId: string, targetSkillId: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get(
      `SELECT id FROM swaps
       WHERE requester_id = ? AND responder_id = ? AND target_skill_id = ? AND status = 'pending'`,
      [requesterId, responderId, targetSkillId]
    );
    return !!existing;
  }

  // UC-SWP-02: full validation flow + insert swap record
  async validateAndSave(data: {
    requesterId: string;
    responderId: string;
    offeredSkillId: string;
    targetSkillId: string;
    wantedSkillId?: string;
    message?: string;
  }) {
    const db = await getDb();

    const ownsSkill = await this.verifyOfferedSkill(data.offeredSkillId, data.requesterId);
    if (!ownsSkill) {
      throw Object.assign(new Error('Offered skill does not belong to requester'), { status: 400 });
    }

    // For bidirectional (request listing) swaps allow request-type listings; otherwise require offer-type
    const targetListing = await db.get(
      'SELECT id, type FROM listings WHERE id = ?',
      [data.targetSkillId]
    );
    if (!targetListing) {
      throw Object.assign(new Error('Target skill is no longer available'), { status: 410 });
    }
    if (targetListing.type === 'offer' && data.wantedSkillId) {
      throw Object.assign(new Error('wantedSkillId is only valid for request listings'), { status: 400 });
    }
    if (targetListing.type === 'request' && !data.wantedSkillId) {
      throw Object.assign(new Error('wantedSkillId is required for request listing swaps'), { status: 400 });
    }

    // For bidirectional swap, verify that wantedSkillId belongs to the listing owner
    if (data.wantedSkillId) {
      const ownerOwnsSkill = await db.get(
        'SELECT id FROM skills WHERE id = ? AND user_id = ?',
        [data.wantedSkillId, data.responderId]
      );
      if (!ownerOwnsSkill) {
        throw Object.assign(new Error('Wanted skill does not belong to the listing owner'), { status: 400 });
      }
    }

    const duplicate = await this.checkDuplicateSwap(data.requesterId, data.responderId, data.targetSkillId);
    if (duplicate) {
      throw Object.assign(new Error('A pending swap request already exists for this skill pair'), { status: 409 });
    }

    const id = randomUUID();
    await db.run(
      `INSERT INTO swaps (id, requester_id, responder_id, offered_skill_id, target_skill_id, wanted_skill_id, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, data.requesterId, data.responderId, data.offeredSkillId, data.targetSkillId, data.wantedSkillId ?? null, data.message ?? null]
    );

    await this.notifyRecipient(data.responderId, id, data.wantedSkillId ? 'bidirectional' : 'standard');

    return { id, status: 'pending' };
  }

  // UC-SWP-02: list pending swaps received by current user (as responder)
  async getReceived(responderId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT sw.id, sw.message, sw.status, sw.created_at,
             s.name AS offered_skill_name, s.level AS offered_skill_level,
             l.title AS target_listing_title,
             ws.name AS wanted_skill_name,
             u.id AS requester_id, u.name AS requester_name, u.avatar AS requester_avatar
      FROM swaps sw
      JOIN skills s ON sw.offered_skill_id = s.id
      JOIN listings l ON sw.target_skill_id = l.id
      LEFT JOIN skills ws ON sw.wanted_skill_id = ws.id
      JOIN users u ON sw.requester_id = u.id
      WHERE sw.responder_id = ? AND sw.status = 'pending'
      ORDER BY sw.created_at DESC
    `, responderId);

    return rows.map((row: any) => ({
      id: row.id,
      offeredSkillName: row.offered_skill_name,
      offeredSkillLevel: row.offered_skill_level,
      targetListingTitle: row.target_listing_title,
      wantedSkillName: row.wanted_skill_name ?? null,
      message: row.message,
      createdAt: row.created_at,
      requester: {
        id: row.requester_id,
        name: row.requester_name,
        avatar: row.requester_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.requester_name)}&background=7c3aed&color=fff`,
      },
    }));
  }

  // UC-SWP-02: responder accepts or rejects a swap
  async handleDecision(swapId: string, responderId: string, decision: 'accepted' | 'rejected') {
    const db = await getDb();
    const swap = await db.get(
      'SELECT id, requester_id FROM swaps WHERE id = ? AND responder_id = ?',
      [swapId, responderId]
    );
    if (!swap) throw Object.assign(new Error('Swap not found or not authorized'), { status: 404 });
    await db.run('UPDATE swaps SET status = ? WHERE id = ?', [decision, swapId]);

    // Notify requester of outcome
    const msg = decision === 'accepted'
      ? 'Το αίτημα ανταλλαγής σου έγινε αποδεκτό!'
      : 'Το αίτημα ανταλλαγής σου απορρίφθηκε.';
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body) VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), swap.requester_id, swapId, msg]
    );

    if (decision === 'accepted') {
      await connectionController.createFromSwap(swapId);
    }

    return { id: swapId, status: decision };
  }

  private async notifyRecipient(responderId: string, swapId: string, kind: 'standard' | 'bidirectional' = 'standard') {
    const db = await getDb();
    const body = kind === 'bidirectional'
      ? 'Κάποιος προτείνει αμοιβαία ανταλλαγή skill! Δες τα αιτήματα ανταλλαγής σου.'
      : 'Έχεις νέο αίτημα ανταλλαγής skill!';
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), responderId, swapId, body]
    );
  }
}

export default new SwapValidator();
