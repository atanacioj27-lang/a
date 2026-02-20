
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  coverImage: string;
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}


export interface Notification {
  id: string;
  type: 'LIKE' | 'FOLLOW' | 'MENTION' | 'SYSTEM';
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}

export enum ViewMode {
  FEED = 'FEED',
  EXPLORE = 'EXPLORE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  PROFILE = 'PROFILE',
  BOOKMARKS = 'BOOKMARKS'
}

