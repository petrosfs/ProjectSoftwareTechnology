// SkillUs — types.ts
// Aligned with Domain Model v0.3

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type SkillStatus = 'active' | 'inactive' | 'pending';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ListingType = 'request' | 'sale';
export type DeliveryMode = 'online' | 'in-person' | 'hybrid';
export type OfferType = 'purchase' | 'collaboration';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type PurchaseStatus = 'completed' | 'failed' | 'refunded';
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type NotificationType = 'push' | 'email' | 'in-app';

// ─── Entity Interfaces ────────────────────────────────────────────────────────

export interface User {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  rating: number;
  notificationPrefs: Record<string, boolean>;
  // UI helpers (not in domain model)
  avatar?: string;
  bio?: string;
  reviewsCount?: number;
  skills?: MySkills[];
}

export interface Profile {
  profileId: string;
  userId: string;
  fullName: string;
  age: number;
  location: string;
  bio: string;
  avatarUrl: string;
  updatedAt: string;
}

export interface Skill {
  skillId: string;
  title: string;
  description: string;
  category: string;
  level: SkillLevel;
  status: SkillStatus;
  isVerified: boolean;
  createdAt: string;
}

export interface MySkills {
  entryId: string;
  userId: string;
  skillId: string;
  addedAt: string;
  verificationStatus: VerificationStatus;
  adminNote: string;
  // UI helper
  name?: string;
  level?: SkillLevel;
  yearsOfExperience?: number;
}

export interface Category {
  categoryId: string;
  name: string;
  parentCategoryId: string | null;
  iconUrl: string;
}

export interface Listing {
  listingId: string;
  userId: string;
  skillId: string;
  type: ListingType;
  title: string;
  description: string;
  budget: number;
  deliveryMode: DeliveryMode;
  publishedAt: string;
  isActive: boolean;
  // UI helpers
  userName?: string;
  userAvatar?: string;
  userRating?: number;
  swapAvailable?: boolean;
}

export interface Price {
  priceId: string;
  skillId: string;
  amount: number;
  currency: string;
  discount: number;
  platformFee: number;
}

export interface Offer {
  offerId: string;
  senderId: string;
  receiverId: string;
  skillId: string;
  listingId: string;
  type: OfferType;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface Swap {
  swapId: string;
  requesterId: string;
  responderId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  status: SwapStatus;
  createdAt: string;
  expiresAt: string;
}

export interface Purchase {
  purchaseId: string;
  buyerId: string;
  sellerId: string;
  skillId: string;
  priceId: string;
  amount: number;
  platformFee: number;
  status: PurchaseStatus;
  purchasedAt: string;
  transactionRef: string;
}

export interface Session {
  sessionId: string;
  requesterUserId: string;
  providerUserId: string;
  skillId: string;
  scheduledAt: string;
  durationMinutes: number;
  deliveryMode: DeliveryMode;
  status: SessionStatus;
  meetingUrl: string;
  createdAt: string;
  // UI helpers
  skillTitle?: string;
  otherUser?: string;
  otherUserAvatar?: string;
}

export interface Review {
  reviewId: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  isFlagged: boolean;
  flagReason: string;
  // UI helpers
  fromUser?: string;
  fromUserAvatar?: string;
  skillTitle?: string;
}

export interface Message {
  messageId: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  body: string;
  sentAt: string;
  isRead: boolean;
}

export interface SkillListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  swapAvailable: boolean;
  type: 'offer' | 'request';
  deliveryMode: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating: number;
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  referenceId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  retryCount: number;
}
