import { FC } from "react";
import Image from "next/image";
import { Trophy, Star, Crown, Target, Gamepad2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  game: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt: string;
}

interface ProfileAchievementsProps {
  profileId: string;
}

const DUMMY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "Radiant Zafer",
    description: "Valorant'ta en yüksek rütbe olan Radiant'a ulaştın!",
    icon: "https://images.1v9.gg/rank%20boosting%20valorant-4b4c0d45d55b.webp",
    game: "Valorant",
    rarity: "common",
    unlockedAt: "2025-03-15"
  },
  {
    id: "2",
    title: "SkyBlock Ustası",
    description: "Minecraft'ta Hypixel sunucusunda SkyBlock derecesi yaptın!",
    icon: "https://media.forgecdn.net/avatars/thumbnails/141/791/256/256/636544733395786830.png",
    game: "Minecraft Hypixel",
    rarity: "rare",
    unlockedAt: "2025-03-20"
  },
  {
    id: "3",
    title: "Topluluk Ruhu",
    description: "İlk sunucuna katıldın!",
    icon: "https://cdn-icons-png.flaticon.com/512/3090/3090423.png",
    game: "Ringard",
    rarity: "epic",
    unlockedAt: "2025-03-25"
  }
];

const rarityConfig = {
  common: {
    icon: Target,
    gradient: "from-zinc-400 to-zinc-600",
    glow: "shadow-zinc-500/20"
  },
  rare: {
    icon: Star,
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/20"
  },
  epic: {
    icon: Crown,
    gradient: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/20"
  },
  legendary: {
    icon: Trophy,
    gradient: "from-amber-400 to-amber-600",
    glow: "shadow-amber-500/20"
  }
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const ProfileAchievements: FC<ProfileAchievementsProps> = ({ profileId }) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6"
    >
      {DUMMY_ACHIEVEMENTS.map((achievement) => {
        const rarity = rarityConfig[achievement.rarity];
        const Icon = rarity.icon;

        return (
          <motion.div
            key={achievement.id}
            variants={item}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { 
                type: "spring",
                stiffness: 300
              }
            }}
            className={cn(
              "group relative p-4",
              "rounded-2xl",
              "bg-gradient-to-b from-black/40 to-black/60",
              "backdrop-blur-md backdrop-saturate-150",
              "hover:from-black/50 hover:to-black/70",
              "transition-all duration-300"
            )}
          >
            {/* Achievement Icon with Glow Effect */}
            <div className="relative mb-4">
              <div className={cn(
                "absolute -inset-1 rounded-xl opacity-50 blur-xl transition-opacity",
                "group-hover:opacity-100",
                `bg-gradient-to-r ${rarity.gradient}`
              )} />
              <div className={cn(
                "relative aspect-square",
                "flex items-center justify-center",
                "rounded-xl overflow-hidden",
                "bg-gradient-to-br",
                rarity.gradient,
                "p-2"
              )}>
                <Image
                  src={achievement.icon}
                  alt={achievement.title}
                  width={240}
                  height={240}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Achievement Info */}
            <div className="text-center space-y-2">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-base tracking-tight"
              >
                {achievement.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-muted-foreground/70 line-clamp-2"
              >
                {achievement.description}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="pt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{achievement.game}</span>
                <span className="mx-1">•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ProfileAchievements;
