import { Router, Request, Response } from 'express';
import listingController from '../controllers/ListingController.js';

export const listingsRouter = Router();

listingsRouter.get('/', async (_req: Request, res: Response) => {
  const listings = await listingController.getListings();
  res.json(listings);
});

listingsRouter.get('/:id', async (req: Request, res: Response) => {
  const listing = await listingController.getListing(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  res.json(listing);
});
