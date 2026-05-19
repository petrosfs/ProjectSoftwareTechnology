import { Router, Request, Response } from 'express';
import mySkillsController from '../controllers/MySkillsController.js';

export const mySkillsRouter = Router();

// UC-SKL-02: get user's skills list
mySkillsRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const skills = await mySkillsController.loadSkills(userId);
  res.json(skills);
});

// UC-SKL-02: add new skill with duplicate check
mySkillsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { name, level, yearsOfExperience } = req.body;
    const skill = await mySkillsController.saveSkill(userId, { name, level, yearsOfExperience });
    res.status(201).json(skill);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-SKL-02: update an existing skill
mySkillsRouter.patch('/:skillId', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const { name, level, yearsOfExperience } = req.body;
    const skill = await mySkillsController.updateSkill(userId, req.params.skillId as string, { name, level, yearsOfExperience });
    res.json(skill);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-SKL-02: remove a skill
mySkillsRouter.delete('/:skillId', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  await mySkillsController.deleteSkill(userId, req.params.skillId as string);
  res.json({ ok: true });
});
