import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import connectionController from './ConnectionController.js';
import paymentController from './PaymentController.js';

export class OfferController {
  // UC-BUY-02: check if a pending offer already exists from buyer for this listing
  async checkDuplicateOffer(buyerId: string, listingId: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get(
      "SELECT id FROM offers WHERE from_user_id = ? AND listing_id = ? AND status = 'pending'",
      [buyerId, listingId]
    );
    return !!existing;
  }

  // UC-BUY-02: create a new offer (status=pending), notify seller
  async saveOffer(data: {
    buyerId: string;
    listingId: string;
    message?: string;
  }) {
    const db = await getDb();

    const listing = await db.get(
      'SELECT id, user_id AS seller_id FROM listings WHERE id = ?',
      data.listingId
    );
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });

    const duplicate = await this.checkDuplicateOffer(data.buyerId, data.listingId);
    if (duplicate) {
      throw Object.assign(new Error('Pending offer already exists for this listing'), { status: 409 });
    }

    const id = randomUUID();
    await db.run(
      `INSERT INTO offers (id, listing_id, from_user_id, to_user_id, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, data.listingId, data.buyerId, listing.seller_id, data.message ?? null]
    );

    await this.notifySeller(listing.seller_id, id);

    return { id, listingId: data.listingId, status: 'pending' };
  }

  // UC-BUY-02: seller accepts or rejects an offer
  async handleDecision(offerId: string, sellerId: string, decision: 'accepted' | 'rejected') {
    const db = await getDb();
    const offer = await db.get(
      'SELECT id, from_user_id AS buyer_id, to_user_id FROM offers WHERE id = ?',
      offerId
    );
    if (!offer) throw Object.assign(new Error('Offer not found'), { status: 404 });
    if (offer.to_user_id !== sellerId) {
      throw Object.assign(new Error('Not authorized'), { status: 403 });
    }

    const fullOffer = await db.get(
      'SELECT listing_id FROM offers WHERE id = ?',
      offerId
    );

    await db.run('UPDATE offers SET status = ? WHERE id = ?', [decision, offerId]);
    await this.notifyBuyer(offer.buyer_id, offerId, decision);

    if (decision === 'accepted') {
      await connectionController.createFromOffer(offerId);
    } else if (decision === 'rejected' && fullOffer?.listing_id) {
      await paymentController.refundPayment(fullOffer.listing_id, offer.buyer_id);
    }

    return { id: offerId, status: decision };
  }

  // UC-BUY-02: list pending offers received by current user (as seller)
  async getReceived(sellerId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT o.id, o.message, o.status, o.created_at,
             l.title AS listing_title, l.price AS listing_price,
             u.id AS buyer_id, u.name AS buyer_name, u.avatar AS buyer_avatar
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users u ON o.from_user_id = u.id
      WHERE o.to_user_id = ? AND o.status = 'pending'
      ORDER BY o.created_at DESC
    `, sellerId);

    return rows.map((row: any) => ({
      id: row.id,
      listingTitle: row.listing_title,
      listingPrice: row.listing_price,
      message: row.message,
      createdAt: row.created_at,
      buyer: {
        id: row.buyer_id,
        name: row.buyer_name,
        avatar: row.buyer_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.buyer_name)}&background=7c3aed&color=fff`,
      },
    }));
  }

  private async notifySeller(sellerId: string, offerId: string) {
    const db = await getDb();
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), sellerId, offerId, 'Νέο αίτημα αγοράς για το skill σου!']
    );
  }

  private async notifyBuyer(buyerId: string, offerId: string, decision: string) {
    const db = await getDb();
    const msg = decision === 'accepted'
      ? 'Το αίτημά σου έγινε αποδεκτό από τον πωλητή!'
      : 'Το αίτημά σου απορρίφθηκε από τον πωλητή.';
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), buyerId, offerId, msg]
    );
  }
}

export default new OfferController();
