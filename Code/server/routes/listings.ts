import { Router, Request, Response } from 'express';
import listingController from '../controllers/ListingController.js';
import searchController from '../controllers/SearchController.js';

export const listingsRouter = Router();

listingsRouter.get('/', (_req: Request, res: Response) => {
  const listings = listingController.getListings();
  res.json(listings);
});

listingsRouter.post('/', (req: Request, res: Response) => {
  const listing = listingController.postListing(req.body);
  res.status(201).json(listing);
});

listingsRouter.get('/search', (req: Request, res: Response) => {
  const { q } = req.query;
  const results = searchController.search(String(q ?? ''));
  res.json(results);
});

listingsRouter.get('/:id', (req: Request, res: Response) => {
  const listing = listingController.getListing(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});
