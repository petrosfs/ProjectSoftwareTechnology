// ListingController.ts
// Source: UC-REQ-02, UC-PST-02

import { Listing, ListingType } from '../types';

export class ListingController {
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
