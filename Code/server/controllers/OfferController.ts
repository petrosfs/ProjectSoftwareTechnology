import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import connectionController from './ConnectionController.js';
import paymentController from './PaymentController.js';

export class OfferController {
  async checkDuplicateOffer(fromUserId: string, listingId: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get(
      "SELECT id FROM offers WHERE from_user_id = ? AND listing_id = ? AND status = 'pending'",
      [fromUserId, listingId]
    );
    return !!existing;
  }

  async saveOffer(data: {
    fromUserId: string;
    listingId: string;
    message?: string;
    proposedPrice?: number | null;
  }) {
    const db = await getDb();

    const listing = await db.get(
      'SELECT id, user_id AS owner_id, title, type FROM listings WHERE id = ?',
      data.listingId
    );
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });

    const duplicate = await this.checkDuplicateOffer(data.fromUserId, data.listingId);
    if (duplicate) {
      throw Object.assign(new Error('Pending offer already exists for this listing'), { status: 409 });
    }

    const sender = await db.get('SELECT name FROM users WHERE id = ?', data.fromUserId);

    const id = randomUUID();
    await db.run(
      `INSERT INTO offers (id, listing_id, from_user_id, to_user_id, message, proposed_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, data.listingId, data.fromUserId, listing.owner_id, data.message ?? null, data.proposedPrice ?? null]
    );

    // Notify the listing owner
    const isRequestListing = listing.type === 'request';
    const senderName = sender?.name ?? 'Κάποιος χρήστης';
    let notifBody: string;
    if (isRequestListing) {
      notifBody = data.proposedPrice
        ? `Ο ${senderName} προσφέρεται να σε διδάξει "${listing.title}" για €${data.proposedPrice}/session. Δες τις προσφορές σου.`
        : `Ο ${senderName} προσφέρεται να σε διδάξει "${listing.title}". Δες τις προσφορές σου.`;
    } else {
      notifBody = `Ο ${senderName} ενδιαφέρεται για το skill σου "${listing.title}". Δες τις προσφορές σου.`;
    }
    await this.insertNotification(listing.owner_id, id, notifBody);

    return { id, listingId: data.listingId, status: 'pending' };
  }

  async handleDecision(offerId: string, userId: string, decision: 'accepted' | 'rejected') {
    const db = await getDb();
    const offer = await db.get(
      `SELECT o.id, o.from_user_id, o.to_user_id, o.listing_id,
              l.title AS listing_title, l.type AS listing_type
       FROM offers o JOIN listings l ON o.listing_id = l.id
       WHERE o.id = ?`,
      offerId
    );
    if (!offer) throw Object.assign(new Error('Offer not found'), { status: 404 });
    if (offer.to_user_id !== userId) {
      throw Object.assign(new Error('Not authorized'), { status: 403 });
    }

    await db.run('UPDATE offers SET status = ? WHERE id = ?', [decision, offerId]);

    // Notify the offer sender
    const isRequestListing = offer.listing_type === 'request';
    const notifBody = decision === 'accepted'
      ? isRequestListing
        ? `Η πρόταση διδασκαλίας σου για "${offer.listing_title}" έγινε αποδεκτή! Προγραμματίστε συνεδρία στο Sessions.`
        : `Η προσφορά σου για "${offer.listing_title}" έγινε αποδεκτή! Προγραμματίστε συνεδρία στο Sessions.`
      : isRequestListing
        ? `Η πρόταση διδασκαλίας σου για "${offer.listing_title}" απορρίφθηκε.`
        : `Η προσφορά σου για "${offer.listing_title}" απορρίφθηκε.`;
    await this.insertNotification(offer.from_user_id, offerId, notifBody);

    if (decision === 'accepted') {
      await connectionController.createFromOffer(offerId);
    } else if (decision === 'rejected' && offer.listing_id) {
      await paymentController.refundPayment(offer.listing_id, offer.from_user_id);
    }

    return { id: offerId, status: decision };
  }

  async getReceived(userId: string) {
    const db = await getDb();
    const rows = await db.all(`
      SELECT o.id, o.message, o.proposed_price, o.status, o.created_at,
             l.title AS listing_title, l.type AS listing_type,
             u.id AS from_id, u.name AS from_name, u.avatar AS from_avatar
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users u ON o.from_user_id = u.id
      WHERE o.to_user_id = ? AND o.status = 'pending'
      ORDER BY o.created_at DESC
    `, userId);

    return rows.map((row: any) => ({
      id: row.id,
      listingTitle: row.listing_title,
      listingType: row.listing_type,
      proposedPrice: row.proposed_price ?? null,
      message: row.message,
      createdAt: row.created_at,
      from: {
        id: row.from_id,
        name: row.from_name,
        avatar: row.from_avatar
          ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.from_name)}&background=7c3aed&color=fff`,
      },
    }));
  }

  private async insertNotification(userId: string, referenceId: string, body: string) {
    const db = await getDb();
    try {
      await db.run(
        `INSERT INTO notifications (id, user_id, type, reference_id, body)
         VALUES (?, ?, 'in-app', ?, ?)`,
        [randomUUID(), userId, referenceId, body]
      );
    } catch { /* non-fatal */ }
  }
}

export default new OfferController();
