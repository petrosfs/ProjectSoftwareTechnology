import { Router, Request, Response } from 'express';
import profileController from '../controllers/ProfileController.js';

export const profileRouter = Router();

// UC-PRF-02: load profile
profileRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const profile = await profileController.loadProfile(userId);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json(profile);
});

// UC-PRF-02: update profile with password verification and email availability check
profileRouter.put('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { fullName, email, newPassword, currentPassword, bio, avatar } = req.body;

    if (!currentPassword) {
      res.status(400).json({ error: 'Απαιτείται ο τρέχων κωδικός' });
      return;
    }

    const passwordOK = await profileController.verifyCurrentPassword(userId, currentPassword);
    if (!passwordOK) {
      res.status(403).json({ error: 'Λανθασμένος τρέχων κωδικός' });
      return;
    }

    if (email) {
      const emailFree = await profileController.checkEmailAvailability(email, userId);
      if (!emailFree) {
        res.status(409).json({ error: 'Το email χρησιμοποιείται ήδη' });
        return;
      }
    }

    const updated = await profileController.updateProfile(userId, { fullName, email, newPassword, bio, avatar });
    res.json(updated);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
