// ListingController.ts
// Source: UC-REQ-02, UC-PST-02

import { Listing, ListingType } from '../../src/app/types';

export class ListingController {
  getListings(): Listing[] {
    // TODO: fetch all active listings from database
    console.warn('ListingController.getListings not implemented');
    return [];
  }

  getListing(listingId: string): Listing | null {
    // TODO: fetch single listing by id from database
    console.warn('ListingController.getListing not implemented');
    return null;
  }

  postListing(fields: Partial<Listing>): Listing | null {
    // TODO: validate and persist new listing, return created listing
    console.warn('ListingController.postListing not implemented');
    return null;
  }

  saveListing(type: ListingType, fields: Partial<Listing>): string {
    // TODO: persist listing to backend, return listingId
    console.warn('ListingController.saveListing not implemented');
    return '';
  }

  validateFields(fields: Partial<Listing>): boolean {
    // TODO: validate title, description, category, budget
    console.warn('ListingController.validateFields not implemented');
    return false;
  }
}

export default new ListingController();
