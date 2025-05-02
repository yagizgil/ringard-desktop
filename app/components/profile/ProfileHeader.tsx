'use client';
import { FC } from "react";
import Image from "next/image";
import { MapPin, Link as LinkIcon, Twitter, BadgeCheck, Globe, Code, Youtube, Shield, Camera, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  background_color: string;
  created_at: string;
}

interface ProfileHeaderProps {
  username: string;
  profile_id: string;
  avatar: string;
  banner: string;
  followers: number;
  following: number;
  posts: number;
  lastSeen: string;
  badges?: Badge[];
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  username,
  profile_id,
  avatar,
  banner,
  followers,
  following,
  posts,
  lastSeen,
  badges = [],
}) => {
  const router = useRouter();
  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-white/10 shadow-lg">
      {/* Banner */}
      <div className="relative h-48 md:h-64 w-full group">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
        <Image
          src={banner}
          alt={`${username}'s banner`}
          fill
          className="object-cover transition-transform duration-500"
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 text-white hover:text-white hover:bg-white/20 rounded-full"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </div>

      {/* Profil Bilgileri */}
      <div className="relative px-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 -mt-12 z-20 relative">
          {/* Avatar */}
          <div className="relative group self-start lg:self-center">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-background shadow-xl">
              <Image
                src={avatar}
                alt={`${username}'s profile`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-xl ring-2 ring-primary">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Kullanıcı Bilgileri */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">{username}</h2>
              <div className="flex gap-2">
                {badges.length > 0 ? (
                  <div className="flex gap-2">
                    {badges.map((badge) => (
                      <TooltipProvider key={badge.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`relative group cursor-pointer hover:scale-110 transition-all duration-300 hover:bg-black/30 rounded-full`}>
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center")}>
                                <Image 
                                  src={badge.icon_url} 
                                  alt={badge.name}
                                  width={28}
                                  height={28}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{badge.name}</p>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ) : (
                  <>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Türkiye</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <a href="#" className="hover:text-primary transition-colors">ringard.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                <a href="#" className="hover:text-primary transition-colors">@ringard</a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>UTC+3</span>
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-9">
                <p className="text-muted-foreground text-sm max-w-2xl">
                  Merhaba! Ben bir oyun geliştiricisiyim ve aynı zamanda yayıncılık yapıyorum. 
                  Yeni oyunlar keşfetmeyi, geliştirmeyi ve toplulukla paylaşmayı seviyorum.
                </p>
              </div>
              <div className="col-span-3">
                <button
                  onClick={() => router.push(`/direct/${profile_id}`)}
                  className="ml-auto bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-orange-500/30 hover:backdrop-blur-lg hover:rounded-lg duration-500 transition-all"
                >
                  Mesaj Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
