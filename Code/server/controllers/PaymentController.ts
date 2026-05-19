import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';

const PLATFORM_FEE_RATE = 0.1;

export class PaymentController {
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
    if (!listing) return { available: false, reason: 'notFound' };

    // Listing is locked if any held purchase exists (regardless of buyer)
    const heldPurchase = await db.get(
      "SELECT id FROM purchases WHERE listing_id = ? AND status = 'held'",
      listingId
    );
    if (heldPurchase) return { available: false, reason: 'alreadyPurchased' };

    const platformFee = Number((listing.price * PLATFORM_FEE_RATE).toFixed(2));
    return {
      available: true,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        platformFee,
        total: Number((listing.price + platformFee).toFixed(2)),
        sellerId: listing.seller_id,
        sellerName: listing.seller_name,
      },
    };
  }

  async holdPayment(listingId: string, buyerId: string) {
    const db = await getDb();

    const listing = await db.get(
      'SELECT id, user_id AS seller_id, price FROM listings WHERE id = ?',
      listingId
    );
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });

    const platformFee = Number((listing.price * PLATFORM_FEE_RATE).toFixed(2));
    const purchaseId = randomUUID();
    const transactionRef = `TXN-${randomUUID().slice(0, 8).toUpperCase()}`;

    await db.run(
      `INSERT INTO purchases (id, buyer_id, seller_id, listing_id, amount, platform_fee, status, transaction_ref)
       VALUES (?, ?, ?, ?, ?, ?, 'held', ?)`,
      [purchaseId, buyerId, listing.seller_id, listingId, listing.price, platformFee, transactionRef]
    );

    return { purchaseId, transactionRef };
  }

  async refundPayment(listingId: string, buyerId: string) {
    const db = await getDb();
    await db.run(
      "UPDATE purchases SET status = 'refunded' WHERE listing_id = ? AND buyer_id = ? AND status = 'held'",
      [listingId, buyerId]
    );
  }

  async releasePayment(listingId: string, buyerId: string) {
    const db = await getDb();
    const purchase = await db.get(
      "SELECT id, amount, platform_fee, seller_id FROM purchases WHERE listing_id = ? AND buyer_id = ? AND status = 'held'",
      [listingId, buyerId]
    );
    if (!purchase) return;

    await db.run("UPDATE purchases SET status = 'completed' WHERE id = ?", purchase.id);

    const netAmount = Number((purchase.amount - purchase.platform_fee).toFixed(2));
    await db.run(
      `INSERT INTO notifications (id, user_id, type, reference_id, body)
       VALUES (?, ?, 'in-app', ?, ?)`,
      [randomUUID(), purchase.seller_id, purchase.id,
       `Η πληρωμή €${netAmount} εγκρίθηκε! Το session ολοκληρώθηκε επιτυχώς.`]
    );
  }
}

export default new PaymentController();
