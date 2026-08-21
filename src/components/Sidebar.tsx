import React from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Camera,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  Zap,
  Info,
  Sparkles,
  HelpCircle,
  Scan,
} from 'lucide-react';
import { ActiveTab, DetectionModelId } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  selectedModel?: DetectionModelId;
  onOpenModelInfo?: () => void;
  onOpenModelInfoModal?: () => void;
  onOpenClassesModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  selectedModel = 'gemini-3.7-flash',
  onOpenModelInfo,
  onOpenModelInfoModal,
  onOpenClassesModal,
}) => {
  const handleOpenModelModal = onOpenModelInfo || onOpenModelInfoModal;

  const navItems = [
    {
      id: 'landing' as ActiveTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'image' as ActiveTab,
      label: 'Image Detection',
      icon: ImageIcon,
      badge: 'Core',
    },
    {
      id: 'camera' as ActiveTab,
      label: 'Live Camera',
      icon: Camera,
      badge: 'Real-Time',
    },
    {
      id: 'history' as ActiveTab,
      label: 'Detection History',
      icon: History,
      badge: historyCount > 0 ? `${historyCount}` : null,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      id="dashboard-sidebar"
      className="w-64 h-full bg-[#111827] border-r border-slate-800 flex flex-col shrink-0 select-none z-20"
    >
      {/* Brand Header */}
      <div
        className="p-6 flex items-center gap-3 cursor-pointer"
        onClick={() => setActiveTab('landing')}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Scan className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">
            VisionDetect <span className="text-blue-500">AI</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            Computer Vision
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-bold border-l-4 border-blue-600'
                  : 'text-slate-400 hover:bg-slate-800/50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span className="text-sm">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Classes Action */}
      {onOpenClassesModal && (
        <div className="px-4 pb-2">
          <button
            onClick={onOpenClassesModal}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors border border-transparent hover:border-slate-700/50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>80+ COCO Classes Directory</span>
          </button>
        </div>
      )}

      {/* Bottom Model Widget */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <div
          onClick={handleOpenModelModal}
          className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all"
        >
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center justify-between">
            <span>Current Model</span>
            <Info className="w-3 h-3 text-slate-400" />
          </p>
          <p className="text-sm text-slate-200 font-semibold truncate">
            {selectedModel === 'gemini-3.7-flash' ? 'Gemini 3.7 Flash' : 'COCO-SSD MobileNet'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            AI Model Ready
          </p>
        </div>
      </div>
    </aside>
  );
};

