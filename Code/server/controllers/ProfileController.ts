// ProfileController.ts
// Source: UC-PRF-02

import { Profile } from '../../src/app/types';

export class ProfileController {
  getProfile(userId: string): Profile | null {
    return this.loadProfile(userId);
  }

  loadProfile(userId: string): Profile | null {
    // TODO: fetch profile from database by userId
    console.warn('ProfileController.loadProfile not implemented');
    return null;
  }

  updateProfile(userId: string, fields: Partial<Profile>): Profile | null {
    // TODO: persist profile changes to database, return updated profile
    console.warn('ProfileController.updateProfile not implemented');
    return null;
  }

  verifyCurrentPassword(userId: string, password: string): boolean {
    // TODO: hash password and compare with stored passwordHash
    console.warn('ProfileController.verifyCurrentPassword not implemented');
    return false;
  }

  checkEmailAvailability(email: string): boolean {
    // TODO: check if email is already in use by another account
    console.warn('ProfileController.checkEmailAvailability not implemented');
    return false;
  }
}

export default new ProfileController();
