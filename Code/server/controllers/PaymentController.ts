// UC-PAY-02: Pay for Skill
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

const PLATFORM_FEE_RATE = 0.1; // 10% platform fee

export class PaymentController {
  // UC-PAY-02: retrieve skill listing and price details for the confirmation screen
  async retrieveSkillData(listingId: string, buyerId: string) {
    const db = await getDb();

    const listing = await db.get(
      `SELECT l.id, l.title, l.description, l.price, l.user_id AS seller_id,
              u.name AS seller_name
       FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.id = ? AND l.type = 'offer'`,
      listingId
    );
    if (!listing) return { available: false, reason: 'notAvailable' };

    const alreadyPurchased = await db.get(
      'SELECT id FROM purchases WHERE listing_id = ? AND buyer_id = ? AND status = ?',
      [listingId, buyerId, 'completed']
    );
    if (alreadyPurchased) return { available: false, reason: 'alreadyPurchased' };

    const platformFee = Number((listing.price * PLATFORM_FEE_RATE).toFixed(2));
    return {
      available: true,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        platformFee,
        sellerId: listing.seller_id,
        sellerName: listing.seller_name,
      },
    };
  }

  // UC-PAY-02: simulate payment processing (no real gateway in this implementation)
  processPayment(amount: number, method: string): { success: boolean; transactionRef: string } {
    if (!amount || amount <= 0 || !method) {
      return { success: false, transactionRef: '' };
    }
    return { success: true, transactionRef: `TXN-${randomUUID().slice(0, 8).toUpperCase()}` };
  }

  // UC-PAY-02: record purchase, unlock access, and notify seller
  async unlockAccess(listingId: string, buyerId: string, transactionRef: string) {
    const db = await getDb();
    const listing = await db.get(
      'SELECT id, user_id AS seller_id, price FROM listings WHERE id = ?',
      listingId
    );
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });

    const platformFee = Number((listing.price * PLATFORM_FEE_RATE).toFixed(2));
    const purchaseId = randomUUID();

    await db.run(
      `INSERT INTO purchases (id, buyer_id, seller_id, listing_id, amount, platform_fee, status, transaction_ref)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [purchaseId, buyerId, listing.seller_id, listingId, listing.price, platformFee, transactionRef]
    );

    await this.notifySeller(listing.seller_id, purchaseId, listing.price - platformFee);

    return { purchaseId, transactionRef };
  }

  private async notifySeller(sellerId: string, purchaseId: string, netAmount: number) {
    const db = await getDb();
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [
        randomUUID(),
        sellerId,
        purchaseId,
        `Νέα αγορά skill! Θα λάβεις €${netAmount.toFixed(2)} μετά την αφαίρεση της προμήθειας.`,
      ]
    );
  }
}

export default new PaymentController();
