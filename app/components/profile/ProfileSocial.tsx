import { FC } from "react";
import Image from "next/image";
import { MessageSquare, Heart, Share2, MoreHorizontal, ImageIcon, Smile, Send, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
  };
  isLiked?: boolean;
}

interface ProfileSocialProps {
  profileId: string;
}

const DUMMY_POSTS: Post[] = [
  {
    id: "1",
    content: "Yeni favori oyunum Elden Ring! Kim benimle co-op yapmak ister? 🎮",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    likes: 124,
    comments: 32,
    shares: 8,
    createdAt: "2 saat önce",
    author: {
      name: "Alex Walker",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"
    },
    isLiked: true
  },
  {
    id: "2",
    content: "Bugün yeni bir başarım kazandım! 🏆 Valorant'ta ilk Radiant rütbeme ulaştım. Emeğimin karşılığını almak harika bir his! ✨",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2070&auto=format&fit=crop",
    likes: 245,
    comments: 48,
    shares: 15,
    createdAt: "5 saat önce",
    author: {
      name: "Alex Walker",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"
    }
  }
];

const ProfileSocial: FC<ProfileSocialProps> = ({ profileId }) => {
  return (
    <div className="mx-auto space-y-6">
      {/* Posts */}
      <div className="space-y-4">
        {DUMMY_POSTS.map((post) => (
          <div
            key={post.id}
            className="bg-card hover:bg-accent/5 rounded-xl shadow-sm border border-white/10 space-y-4 transition-colors overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{post.author.name}</h3>
                  <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="px-4">
              <p className="text-base leading-relaxed">{post.content}</p>
            </div>
            
            {/* Post Image */}
            {post.image && (
              <div className="relative aspect-[16/9] group/image">
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity" />
                <Image
                  src={post.image}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Post Actions */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-6">
                  <button
                    className={cn(
                      "flex items-center gap-2 text-sm transition-colors",
                      post.isLiked
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-all",
                        post.isLiked && "fill-current scale-110"
                      )}
                    />
                    <span className="text-xs font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-xs font-medium">{post.shares}</span>
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary rounded-full"
                >
                  Yorum Yap
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSocial;
