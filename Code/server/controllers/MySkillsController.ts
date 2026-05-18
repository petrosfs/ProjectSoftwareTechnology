// UC-SKL-02: Manage MySkills
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

export class MySkillsController {
  async loadSkills(userId: string) {
    const db = await getDb();
    const rows = await db.all(
      'SELECT id, user_id, name, level, years_of_experience FROM skills WHERE user_id = ? ORDER BY name ASC',
      userId
    );
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      level: row.level,
      yearsOfExperience: row.years_of_experience,
    }));
  }

  // UC-SKL-02: check if skill name already exists for this user (duplicate check)
  async checkDuplicate(userId: string, name: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get(
      'SELECT id FROM skills WHERE user_id = ? AND LOWER(name) = LOWER(?)',
      [userId, name]
    );
    return !!existing;
  }

  // UC-SKL-02: persist a new skill entry for the user
  async saveSkill(userId: string, data: {
    name: string;
    level: string;
    yearsOfExperience?: number;
  }) {
    if (!data.name?.trim() || !data.level) {
      throw Object.assign(new Error('Name and level are required'), { status: 400 });
    }

    const duplicate = await this.checkDuplicate(userId, data.name);
    if (duplicate) {
      throw Object.assign(new Error('Skill already exists in your profile'), { status: 409 });
    }

    const db = await getDb();
    const id = randomUUID();
    await db.run(
      'INSERT INTO skills (id, user_id, name, level, years_of_experience) VALUES (?, ?, ?, ?, ?)',
      [id, userId, data.name.trim(), data.level, data.yearsOfExperience ?? 0]
    );
    return { id, userId, name: data.name.trim(), level: data.level, yearsOfExperience: data.yearsOfExperience ?? 0 };
  }

  async updateSkill(userId: string, skillId: string, data: {
    name?: string;
    level?: string;
    yearsOfExperience?: number;
  }) {
    const db = await getDb();
    const skill = await db.get('SELECT id FROM skills WHERE id = ? AND user_id = ?', [skillId, userId]);
    if (!skill) throw Object.assign(new Error('Skill not found'), { status: 404 });

    if (data.name) {
      const dup = await db.get(
        'SELECT id FROM skills WHERE user_id = ? AND LOWER(name) = LOWER(?) AND id != ?',
        [userId, data.name, skillId]
      );
      if (dup) throw Object.assign(new Error('Skill already exists in your profile'), { status: 409 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (data.name) { updates.push('name = ?'); values.push(data.name.trim()); }
    if (data.level) { updates.push('level = ?'); values.push(data.level); }
    if (data.yearsOfExperience !== undefined) { updates.push('years_of_experience = ?'); values.push(data.yearsOfExperience); }

    if (updates.length > 0) {
      values.push(skillId);
      await db.run(`UPDATE skills SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = await db.get('SELECT id, user_id, name, level, years_of_experience FROM skills WHERE id = ?', skillId);
    return { id: updated.id, userId: updated.user_id, name: updated.name, level: updated.level, yearsOfExperience: updated.years_of_experience };
  }

  async deleteSkill(userId: string, skillId: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM skills WHERE id = ? AND user_id = ?', [skillId, userId]);
  }
}

export default new MySkillsController();
