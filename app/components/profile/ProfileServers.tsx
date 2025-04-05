import { FC } from "react";
import Image from "next/image";
import { Users, Crown, Gamepad2, Code2, Film, Music2, Settings, ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Server {
  id: string;
  name: string;
  icon: string;
  banner: string;
  memberCount: number;
  isOwner: boolean;
  category: "gaming" | "development" | "entertainment" | "music";
  description: string;
  active: boolean;
}

interface ProfileServersProps {
  profileId: string;
}

const categoryConfig = {
  gaming: {
    icon: Gamepad2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    badge: "text-green-500 bg-green-100 dark:bg-green-900/30",
    label: "Oyun"
  },
  development: {
    icon: Code2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    badge: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    label: "Geliştirme"
  },
  entertainment: {
    icon: Film,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    badge: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    label: "Eğlence"
  },
  music: {
    icon: Music2,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    badge: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
    label: "Müzik"
  }
};

const DUMMY_SERVERS: Server[] = [
  {
    id: "1",
    name: "Valorant Türkiye",
    icon: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2070&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2070&auto=format&fit=crop",
    memberCount: 12345,
    isOwner: true,
    category: "gaming",
    description: "Türkiye'nin en büyük Valorant topluluğu",
    active: true
  },
  {
    id: "2",
    name: "Web Developers",
    icon: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2074&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2074&auto=format&fit=crop",
    memberCount: 5678,
    isOwner: true,
    category: "development",
    description: "Frontend ve Backend geliştiricileri topluluğu",
    active: true
  },
  {
    id: "3",
    name: "Film & Dizi Kulubü",
    icon: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
    memberCount: 8901,
    isOwner: false,
    category: "entertainment",
    description: "Film ve dizi önerileri, tartışmalar",
    active: true
  },
  {
    id: "4",
    name: "Müzik Odası",
    icon: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop",
    memberCount: 3456,
    isOwner: false,
    category: "music",
    description: "Müzik paylaşımları ve sohbetler",
    active: false
  }
];

const ProfileServers: FC<ProfileServersProps> = ({ profileId }) => {
  const ownedServers = DUMMY_SERVERS.filter(server => server.isOwner);
  const joinedServers = DUMMY_SERVERS.filter(server => !server.isOwner);

  const ServerList = ({ servers, title }: { servers: Server[], title: string }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        <Button variant="ghost" size="sm" className="gap-1 text-sm">
          <Settings className="w-4 h-4" />
          Yönet
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {servers.map((server) => {
          const category = categoryConfig[server.category];
          const Icon = category.icon;

          return (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="group rounded-2xl bg-[var(--card)] border border-white/5 shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.015] transition-transform"
            >
              <div className="relative h-32 w-full">
                <Image
                  src={server.banner}
                  alt="banner"
                  fill
                  className="object-cover object-center"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md relative">
                    <Image src={server.icon} alt={server.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-semibold text-base truncate">
                        {server.name}
                      </h4>
                      {server.isOwner && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {server.description}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {server.memberCount.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={cn("w-2 h-2 rounded-full bg-green-500")}/>
                    1.275
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {ownedServers.length > 0 && (
        <ServerList servers={ownedServers} title="Sahip Olduğu Sunucular" />
      )}
      {joinedServers.length > 0 && (
        <ServerList servers={joinedServers} title="Üye Olduğu Sunucular" />
      )}
    </div>
  );
};

export default ProfileServers;
