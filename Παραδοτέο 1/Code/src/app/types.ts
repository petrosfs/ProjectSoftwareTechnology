export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  skills: UserSkill[];
}

export interface UserSkill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  yearsOfExperience: number;
}

export interface SkillListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  swapAvailable: boolean;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating: number;
  type: 'offer' | 'request';
  createdAt: string;
}

export interface Session {
  id: string;
  skillTitle: string;
  otherUser: string;
  otherUserAvatar: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'teaching' | 'learning';
}

export interface Review {
  id: string;
  fromUser: string;
  fromUserAvatar: string;
  rating: number;
  comment: string;
  date: string;
  skillTitle: string;
}
