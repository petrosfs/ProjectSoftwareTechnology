// ProfileController.ts
// Source: UC-PRF-02

import { Profile } from '../types';

export class ProfileController {
  loadProfile(userId: string): Profile | null {
    // TODO: fetch profile from backend by userId
    console.warn('ProfileController.loadProfile not implemented');
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

  updateProfile(userId: string, fields: Partial<Profile>): void {
    // TODO: persist profile changes to backend
    console.warn('ProfileController.updateProfile not implemented');
  }
}

export default new ProfileController();
