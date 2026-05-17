// UC-PRF-02: Edit Profile
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';

export class ProfileController {
  async loadProfile(userId: string) {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, avatar, bio, rating, reviews_count FROM users WHERE id = ?',
      userId
    );
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      reviewsCount: user.reviews_count ?? 0,
    };
  }

  // UC-PRF-02: verify the user's current password before allowing edits
  async verifyCurrentPassword(userId: string, password: string): Promise<boolean> {
    const db = await getDb();
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', userId);
    if (!user) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  // UC-PRF-02: ensure new email is not already taken by another account
  async checkEmailAvailability(email: string, currentUserId: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [String(email).toLowerCase().trim(), currentUserId]
    );
    return !existing;
  }

  // UC-PRF-02: apply validated field updates
  async updateProfile(userId: string, fields: {
    fullName?: string;
    email?: string;
    newPassword?: string;
    bio?: string;
    avatar?: string;
  }) {
    const db = await getDb();
    const updates: string[] = [];
    const values: any[] = [];

    if (fields.fullName) {
      updates.push('name = ?');
      values.push(fields.fullName.trim());
    }
    if (fields.email) {
      updates.push('email = ?');
      values.push(fields.email.toLowerCase().trim());
    }
    if (fields.newPassword) {
      const hash = await bcrypt.hash(fields.newPassword, 10);
      updates.push('password_hash = ?');
      values.push(hash);
    }
    if (fields.bio !== undefined) {
      updates.push('bio = ?');
      values.push(fields.bio);
    }
    if (fields.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(fields.avatar);
    }

    if (updates.length > 0) {
      values.push(userId);
      await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.loadProfile(userId);
  }
}

export default new ProfileController();
