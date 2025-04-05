export interface Member {
  id: string;
  name: string;
  avatar: string;
  banner?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  activity?: 'Gaming' | 'Working' | 'Listening' | 'Coding';
  friendCount: number;
  postCount: number;
  mutualFriends?: {
    id: string;
    name: string;
    avatar: string;
    status: string;
    activity: string;
  }[]
  mutualServers?: {
    id: string;
    name: string;
    icon: string;
  }[];
}
