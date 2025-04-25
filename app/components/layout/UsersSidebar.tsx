'use client';

import Image from 'next/image';
import { ChevronDown, ChevronRight, Timer, Check, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'online' | 'idle' | 'dnd' | 'offline';

interface OnlineUser {
  id: number;
  name: string;
  avatar: string;
  status: Status;
  activity?: string;
  time?: string;
  theme: {
    from: string;
    to: string;
    image: string;
  };
}

interface FRIEND_REQUESTS {
  user_id: string;
  username: string;
  avatar_id: string | null;
  requested_at: string;
}

interface Friend {
  user_id: string;
  username: string;
  avatar_id: string | null;
  status: number;
  is_online: boolean;
  added_at: string;
}

const STATUS_COLORS: Record<Status, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500'
};

export default function UsersSidebar() {
  const router = useRouter();
  const [openRequests, setOpenRequests] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FRIEND_REQUESTS[]>([]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [addFriendError, setAddFriendError] = useState('');
  const [addFriendSuccess, setAddFriendSuccess] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriendRequests = async () => {
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        console.error('Access token not found');
        return;
      }

      const response = await fetch('http://api.ringard.net/user/friends/requests', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friend requests');
      }

      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        console.error('Access token not found');
        return;
      }

      const response = await fetch(`http://api.ringard.net/user/friends/accept/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the accepted request from the list
        setFriendRequests(prev => prev.filter(req => req.user_id !== userId));
      } else {
        console.error('Error accepting friend request:', data.message);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        console.error('Access token not found');
        return;
      }

      const response = await fetch(`http://api.ringard.net/user/friends/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the rejected request from the list
        setFriendRequests(prev => prev.filter(req => req.user_id !== userId));
      } else {
        console.error('Error rejecting friend request:', data.message);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFriendError('');
    setAddFriendSuccess('');

    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        setAddFriendError('Access token not found');
        return;
      }

      const response = await fetch(`http://api.ringard.net/user/friends/add/${newFriendId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAddFriendSuccess('Friend request sent successfully');
        setNewFriendId('');
        setTimeout(() => {
          setIsAddFriendOpen(false);
        }, 2000);
      } else {
        setAddFriendError(data.message);
      }
    } catch (error) {
      setAddFriendError('An error occurred while sending the friend request');
    }
  };

  const fetchFriends = async () => {
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        console.error('Access token not found');
        return;
      }

      const response = await fetch('http://api.ringard.net/user/friends', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--card)] flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Çevrimiçi — {friends.filter(friend => friend.is_online).length}
        </h2>
        <button
          onClick={() => setIsAddFriendOpen(!isAddFriendOpen)}
          className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition"
          title="Add Friend"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add Friend Form */}
      {isAddFriendOpen && (
        <div className="px-4 py-3 border-b border-[var(--card)]">
          <form onSubmit={handleAddFriend} className="space-y-3">
            <div>
              <label htmlFor="newFriendId" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                User ID
              </label>
              <input
                type="text"
                id="newFriendId"
                value={newFriendId}
                onChange={(e) => setNewFriendId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
                required
              />
            </div>

            {addFriendError && (
              <p className="text-red-500 text-sm">{addFriendError}</p>
            )}

            {addFriendSuccess && (
              <p className="text-green-500 text-sm">{addFriendSuccess}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Send Friend Request
            </button>
          </form>
        </div>
      )}

      {/* 🔽 Arkadaşlık İstekleri */}
      <div className="px-4 py-2 border-b border-[var(--card)] cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition" onClick={() => setOpenRequests(!openRequests)}>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Arkadaşlık İstekleri — {friendRequests.length}
        </h2>
        {openRequests ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {openRequests && (
        <div className="px-4 py-3 space-y-3 border-b border-[var(--card)]">
          {friendRequests.map((req) => (
            <div
              key={req.user_id}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl p-3 shadow-sm border border-white/10"
            >
              {/* Sol taraf - avatar + isim */}
              <div className="flex items-center gap-3">
                <Image
                  src={req.avatar_id ? `http://api.ringard.net/user/avatar/${req.avatar_id}` : '/default-avatar.png'}
                  alt={req.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover ring-2 ring-white/10 max-w-10 max-h-10 w-full h-full"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {req.username}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(req.requested_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
        
              {/* Sağ taraf - butonlar */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptRequest(req.user_id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-300 transition"
                  title="Kabul Et"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleRejectRequest(req.user_id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                  title="Reddet"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {friends.map((friend) => (
          <div 
            key={friend.user_id}
            className="group px-2 mx-2"
          >
            <div className="relative overflow-hidden rounded-xl">
              {/* Background Image & Gradient */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <Image
                  src={friend.avatar_id ? `http://api.ringard.net/user/avatar/${friend.avatar_id}` : 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=400&q=80'}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity`} />

              {/* Content */}
              <button onClick={() => router.push(`/profile/${friend.username}`)} className="relative p-3">
                <div className="flex items-center gap-3">
                  {/* Avatar & Status */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                      <Image
                        src={friend.avatar_id ? `http://api.ringard.net/user/avatar/${friend.avatar_id}` : '/default-avatar.png'}
                        alt={friend.username}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${friend.is_online ? STATUS_COLORS.online : STATUS_COLORS.offline}`}
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {friend.username}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {friend.is_online ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
