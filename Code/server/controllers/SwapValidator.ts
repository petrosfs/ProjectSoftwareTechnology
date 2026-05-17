// UC-SWP-02: Request Skill Swap
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

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
    message?: string;
  }) {
    const db = await getDb();

    const ownsSkill = await this.verifyOfferedSkill(data.offeredSkillId, data.requesterId);
    if (!ownsSkill) {
      throw Object.assign(new Error('Offered skill does not belong to requester'), { status: 400 });
    }

    const targetListing = await db.get(
      'SELECT id FROM listings WHERE id = ? AND type = ?',
      [data.targetSkillId, 'offer']
    );
    if (!targetListing) {
      throw Object.assign(new Error('Target skill is no longer available'), { status: 410 });
    }

    const duplicate = await this.checkDuplicateSwap(data.requesterId, data.responderId, data.targetSkillId);
    if (duplicate) {
      throw Object.assign(new Error('A pending swap request already exists for this skill pair'), { status: 409 });
    }

    const id = randomUUID();
    await db.run(
      `INSERT INTO swaps (id, requester_id, responder_id, offered_skill_id, target_skill_id, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, data.requesterId, data.responderId, data.offeredSkillId, data.targetSkillId, data.message ?? null]
    );

    await this.notifyRecipient(data.responderId, id);

    return { id, status: 'pending' };
  }

  private async notifyRecipient(responderId: string, swapId: string) {
    const db = await getDb();
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), responderId, swapId, 'Έχεις νέο αίτημα ανταλλαγής skill!']
    );
  }
}

export default new SwapValidator();
