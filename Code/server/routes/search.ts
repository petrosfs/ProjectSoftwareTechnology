import { Router, Request, Response } from 'express';
import searchController from '../controllers/SearchController.js';

export const searchRouter = Router();

// UC-SRC-02: autocomplete suggestions (must be before /:id to avoid route conflict)
searchRouter.get('/suggestions', async (req: Request, res: Response) => {
  const keyword = String(req.query.q ?? '').trim();
  if (!keyword) {
    res.json([]);
    return;
  }
  const suggestions = await searchController.getSuggestions(keyword);
  res.json(suggestions);
});

// UC-SRC-02: search listings by keyword
searchRouter.get('/', async (req: Request, res: Response) => {
  const keyword = String(req.query.q ?? '').trim();
  if (!keyword) {
    res.status(400).json({ error: 'Query parameter q is required' });
    return;
  }

  const results = await searchController.initiateSearch(keyword);
  if (results.length === 0) {
    const suggestions = await searchController.getSuggestions(keyword);
    res.json({ results: [], suggestions });
    return;
  }
  res.json({ results, suggestions: [] });
});

// UC-SRC-02: get full skill/listing details
searchRouter.get('/:id', async (req: Request, res: Response) => {
  const detail = await searchController.getSkillDetails(req.params.id);
  if (!detail) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  res.json(detail);
});
