import { Plus } from 'lucide-react';
import { useTabsManagerContext } from '../../contexts/TabsManagerContext';
import TabButton from './TabButton';

export default function TabsBar() {
  const {
    tabs,
    setActiveTab,
    activeTabIndex,
    canCreateNewTab,
    newTab,
    closeTab,
    setTabTitle,
  } = useTabsManagerContext();

  return (
    <div className="flex flex-row w-full">
      {tabs.map((tab, index) => (
        <TabButton
          key={tab.id}
          tab={tab}
          index={index}
          isActive={index === activeTabIndex}
          setActiveTab={setActiveTab}
          closeTab={closeTab}
          setTabTitle={setTabTitle}
        />
      ))}

      {canCreateNewTab && (
        <button type="button" onClick={newTab} className="ml-2">
          <Plus />
        </button>
      )}
    </div>
  );
}
