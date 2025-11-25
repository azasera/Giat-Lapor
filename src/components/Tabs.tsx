import React, { useState, useCallback } from 'react';

interface TabProps {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabProps[];
  defaultActiveTabId?: string;
}

// Color mapping for different bidang (fields)
const getTabColors = (label: string) => {
  const colorMap: { [key: string]: { bg: string; text: string; border: string; hover: string } } = {
    'Keuangan & Administrasi': {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    'Pengembangan SDM Guru / Staff': {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-700',
      hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
    },
    'Pembinaan Karakter Santri': {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-700',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    'Hubungan Masyarakat': {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-700',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
    }
  };
  
  return colorMap[label] || {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30'
  };
};

const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveTabId }) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveTabId || (tabs.length > 0 ? tabs[0].id : ''));

  const handleTabClick = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const activeTabContent = tabs.find(tab => tab.id === activeTabId)?.content;

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-6">
        {tabs.map(tab => {
          const colors = getTabColors(tab.label);
          const isActive = activeTabId === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap rounded-lg
                border-2 transition-all duration-200 ease-in-out
                ${isActive 
                  ? `${colors.bg} ${colors.text} ${colors.border} shadow-md transform scale-105` 
                  : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 ${colors.hover} hover:shadow-sm`
                }
              `}
            >
              <div className="flex items-center space-x-2">
                {/* Color indicator block */}
                <div className={`
                  w-3 h-3 rounded-full
                  ${isActive 
                    ? colors.text.replace('text-', 'bg-').replace('-700', '-500').replace('-300', '-400')
                    : 'bg-gray-400 dark:bg-gray-500'
                  }
                `} />
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;