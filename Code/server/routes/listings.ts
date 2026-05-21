import { Router, Request, Response } from 'express';
import listingController from '../controllers/ListingController.js';

export const listingsRouter = Router();

listingsRouter.get('/', async (_req: Request, res: Response) => {
  const listings = await listingController.getListings();
  res.json(listings);
});

listingsRouter.get('/:id', async (req: Request, res: Response) => {
  const listing = await listingController.getListing(req.params.id as string);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  res.json(listing);
});

// Delete own listing
listingsRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    await listingController.deleteListing(req.params.id as string, userId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-REQ-02 & UC-PST-02: post a new listing
listingsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { title, description, category, price, swapAvailable, type, deliveryMode } = req.body;
    const listing = await listingController.saveListing({
      userId,
      title,
      description,
      category,
      price: price ?? null,
      swapAvailable: !!swapAvailable,
      type,
      deliveryMode,
    });
    res.status(201).json(listing);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
