import React from 'react';
import { Users, Trophy, GraduationCap, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  liveMatchCount?: number;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onTabChange,
  liveMatchCount = 0,
}) => {
  const tabs = [
    {
      id: 'teams' as TabType,
      label: 'Teams',
      icon: Users,
    },
    {
      id: 'matches' as TabType,
      label: 'Matches',
      icon: Trophy,
      badge: liveMatchCount > 0 ? `${liveMatchCount} Live` : undefined,
    },
    {
      id: 'academy' as TabType,
      label: 'Academy',
      icon: GraduationCap,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      id="main-tab-bar"
      className="bg-[#0B1220]/95 backdrop-blur-md border-t border-slate-800 fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#1d978e] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 bg-[#1d978e] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
