'use client';
import { use } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, Trophy, Layout } from "lucide-react";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileSocial from "@/app/components/profile/ProfileSocial";
import ProfileAchievements from "@/app/components/profile/ProfileAchievements";
import ProfileServers from "@/app/components/profile/ProfileServers";
import { useParams } from 'next/navigation';
import MainLayout from '@/app/components/layout/MainLayout';



export default function ProfilePage() {
    const params = useParams();
    const profileId = params?.profileId as string;
  
  return (
    <MainLayout>
      <div className="w-full mx-auto pb-4">

        <div className="container max-w-6xl mx-auto px-4">
          <ProfileHeader
            username="Alex Walker"
            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"
            banner="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop"
            followers={1234}
            following={567}
            posts={89}
            lastSeen="2 saat önce"
          />

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
        </div>
      </div>
    </MainLayout>
  );
}
