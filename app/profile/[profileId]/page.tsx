'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, Trophy, Layout, UserPlus } from "lucide-react";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileSocial from "@/app/components/profile/ProfileSocial";
import ProfileAchievements from "@/app/components/profile/ProfileAchievements";
import ProfileServers from "@/app/components/profile/ProfileServers";
import { useParams } from 'next/navigation';
import MainLayout from '@/app/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  avatar_id: string | null;
  banner_id: string | null;
  email: string;
  created_at: string;
  country: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  preferred_language: string | null;
  unique_code: string | null;
  status: number;
  custom_status: string | null;
  is_online: boolean | null;
  last_online_at: string | null;
  profile_visibility: string;
  message?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  background_color: string;
  created_at: string;
}

interface ApiResponse {
  badges: Badge[];
  data: UserProfile;
}

export default function ProfilePage() {
  const params = useParams();
  const profileId = params?.profileId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        if (!accessToken) {
          setError('Access token not found');
          return;
        }

        const response = await fetch(`http://localhost:8021/user/profile/${profileId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const apiResponse: ApiResponse = await response.json();
        if (response.ok) {
          setProfile(apiResponse.data);
          setBadges(apiResponse.badges);
          // Check if profile is private (has message property with specific text)
          if (apiResponse.data.message === "This profile can only be viewed by friends") {
            setIsPrivate(true);
          }
        } else {
          setError(apiResponse.data.message || 'Failed to fetch profile');
        }
      } catch (error) {
        setError('An error occurred while fetching the profile');
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleAddFriend = async () => {
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        setError('Access token not found');
        return;
      }

      const response = await fetch(`http://api.ringard.net/user/friends/u/add/${profileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setIsFriendRequestSent(true);
      } else {
        setError(data.message || 'Failed to send friend request');
      }
    } catch (error) {
      setError('An error occurred while sending the friend request');
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full mx-auto pb-4">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-700 rounded-2xl mb-6"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 bg-gray-700 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    // Don't show error alert for private profile message
    if (error === "This profile can only be viewed by friends") {
      // This will be handled in the main render
    } else {
      return (
        <MainLayout>
          <div className="w-full mx-auto pb-4">
            <div className="container max-w-6xl mx-auto px-4 py-8">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          </div>
        </MainLayout>
      );
    }
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="w-full mx-auto pb-4">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>User not found</AlertDescription>
            </Alert>
          </div>
        </div>
      </MainLayout>
    );
  }

  const avatarUrl = profile.avatar_id 
    ? `http://api.ringard.net/user/avatar/${profile.avatar_id}` 
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop';
  
  const bannerUrl = profile.banner_id 
    ? `http://api.ringard.net/user/banner/${profile.banner_id}` 
    : 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop';

  return (
    <MainLayout>
      <div className="w-full mx-auto pb-4">
        <div className="container max-w-6xl mx-auto px-4">
          <ProfileHeader
            username={profile.username}
            avatar={avatarUrl}
            banner={bannerUrl}
            followers={0} // These values would come from additional API calls
            following={0}
            posts={0}
            lastSeen={profile.last_online_at ? new Date(profile.last_online_at).toLocaleString('tr-TR') : 'Never'}
            badges={badges}
          />

          {isPrivate ? (
            <div className="mt-8 p-6 bg-card rounded-xl border border-white/10 text-center">
              <h3 className="text-xl font-semibold mb-2">Private Profile</h3>
              <p className="text-muted-foreground mb-6">
                This profile is private. You can only see basic information. To view the full profile, you need to be friends with {profile.username}.
              </p>
              {!isFriendRequestSent ? (
                <Button onClick={handleAddFriend} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </Button>
              ) : (
                <Button disabled className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Friend Request Sent
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <Tabs defaultValue="social" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-card/50 p-1 rounded-full">
                    <TabsTrigger
                      value="social"
                      className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                    >
                      <Users2 className="w-4 h-4" />
                      Sosyal
                    </TabsTrigger>
                    <TabsTrigger
                      value="achievements"
                      className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      Başarımlar
                    </TabsTrigger>
                    <TabsTrigger
                      value="servers"
                      className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                    >
                      <Layout className="w-4 h-4" />
                      Sunucular
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="social" className="focus-visible:outline-none focus-visible:ring-0">
                  <ProfileSocial profileId={profileId} />
                </TabsContent>
                <TabsContent value="achievements" className="focus-visible:outline-none focus-visible:ring-0">
                  <ProfileAchievements profileId={profileId} />
                </TabsContent>
                <TabsContent value="servers" className="focus-visible:outline-none focus-visible:ring-0">
                  <ProfileServers profileId={profileId} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
