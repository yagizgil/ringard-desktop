'use client';
import ServerLayout from '../../../../components/layout/ServerLayout';
import { MemberModalProvider } from '@/app/context/MemberModalContext';
import MemberModal from '@/app/components/modals/MemberModal';
import { useParams } from 'next/navigation';
import TextChannel from '@/app/components/channel/TextChannel';
import AnnouncementChannel from '@/app/components/channel/AnnouncementChannel';
import BlogChannel from '@/app/components/channel/BlogChannel';
import SupportChannel from '@/app/components/channel/SupportChannel';
import { Channel } from '@/app/types/channel';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  // Örnek kanal bilgileri - Bu kısım gerçek uygulamada API'den gelecek
  const channel: Channel = {
    id: channelId,
    name: 'Destek',
    type: 'support',
    topic: 'Destek Talepleri'
  };

  // Örnek kullanıcı rolü - Bu kısım gerçek uygulamada auth sisteminden gelecek
  const isAdmin = false; // Şimdilik true olarak ayarlıyoruz, gerçek uygulamada kullanıcı rolüne göre değişecek

  const renderChannel = () => {
    switch (channel.type) {
      case 'announcement':
        return (
          <AnnouncementChannel
            channelId={channel.id}
            channelName={channel.name}
            topic={channel.topic}
            isAdmin={isAdmin}
          />
        );
      case 'blog':
        return (
          <BlogChannel
            channelId={channel.id}
            channelName={channel.name}
            topic={channel.topic}
            isAdmin={isAdmin}
          />
        );
      case 'support':
        return (
          <SupportChannel
            channelId={channel.id}
            channelName={channel.name}
            topic={channel.topic}
            isAdmin={isAdmin}
          />
        );
      case 'text':
      default:
        return (
          <TextChannel
            channelId={channel.id}
            channelName={channel.name}
            topic={channel.topic}
          />
        );
    }
  };

  return (
    <MemberModalProvider>
      <ServerLayout>
        <div className="flex-1 flex flex-col">
          <MemberModal />
          {renderChannel()}
        </div>
      </ServerLayout>
    </MemberModalProvider>
  );
}
