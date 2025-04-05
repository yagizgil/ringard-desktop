import { TabType } from '@/app/types/tabs';
import SocialTab from './SocialTab';
import NewsTab from './NewsTab';
import UpdatesTab from './UpdatesTab';
import MarketTab from './MarketTab';

interface TabContentProps {
  activeTab: TabType;
}

export default function TabContent({ activeTab }: TabContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'social':
        return <SocialTab />;
      case 'news':
        return <NewsTab />;
      case 'updates':
        return <UpdatesTab />;
      case 'market':
        return <MarketTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {renderContent()}
    </div>
  );
}
