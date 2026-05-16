import { getDb } from '../db/database.js';

export class SkillController {
  async getUserSkills(userId: string) {
    const db = await getDb();
    const rows = await db.all(
      `SELECT id, name, level, years_of_experience
       FROM skills
       WHERE user_id = ?
       ORDER BY CASE level WHEN 'Expert' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END, name ASC`,
      userId
    );
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      yearsOfExperience: row.years_of_experience,
    }));
  }
}

export default new SkillController();
