import React from 'react';
import {
  Cpu,
  HelpCircle,
  Play,
  Sun,
  Moon,
  Monitor,
  Activity,
  Layers,
} from 'lucide-react';
import { ActiveTab, DetectionModelId } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedModel: DetectionModelId;
  setSelectedModel: (model: DetectionModelId) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  onOpenClassesModal?: () => void;
  onOpenModelInfoModal?: () => void;
  onQuickDemo?: () => void;
  isModelReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  theme,
  setTheme,
  onOpenClassesModal,
  onOpenModelInfoModal,
  onQuickDemo,
}) => {
  const getTabLabel = () => {
    switch (activeTab) {
      case 'landing':
        return 'Overview / Welcome';
      case 'image':
        return 'Workspace / Detection_042.jpg';
      case 'camera':
        return 'Live Stream / Webcam_Feed_01';
      case 'history':
        return 'Archive / Session_History';
      case 'analytics':
        return 'Metrics / Spatial_Analytics';
      case 'settings':
        return 'Configuration / Preferences';
      default:
        return 'Workspace / Active';
    }
  };

  return (
    <header
      id="app-header"
      className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#111827]/30 backdrop-blur-md shrink-0 z-10"
    >
      {/* Workspace Path Breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="text-slate-100 font-medium text-sm tracking-tight flex items-center gap-2">
          <span>{getTabLabel()}</span>
        </h2>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
          PRO_LICENSED
        </span>
      </div>

      {/* Center Engine Indicator */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-400">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as DetectionModelId)}
            aria-label="Active Detection Model"
            className="cursor-pointer bg-transparent font-semibold text-blue-400 hover:text-blue-300 focus:outline-none"
          >
            <option value="gemini-3.7-flash" className="bg-slate-900 text-white">Gemini 3.7 Flash (Cloud AI)</option>
            <option value="coco-ssd-edge" className="bg-slate-900 text-white">COCO-SSD MobileNet (Edge WebML)</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px]">AI Model Ready</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {onOpenClassesModal && (
          <button
            onClick={onOpenClassesModal}
            className="hidden items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700/50 transition-all sm:flex"
            title="Browse 80+ Supported Object Classes"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Classes Directory</span>
          </button>
        )}

        {activeTab !== 'image' && (
          <button
            onClick={() => setActiveTab('image')}
            className="hidden items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/20 transition-all sm:flex"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Open Canvas</span>
          </button>
        )}

        {/* Theme Switcher */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
          <button
            onClick={() => setTheme('dark')}
            className={`rounded-md p-1.5 text-slate-400 transition-colors ${
              theme === 'dark' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'hover:text-slate-200'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`rounded-md p-1.5 text-slate-400 transition-colors ${
              theme === 'light' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'hover:text-slate-200'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`rounded-md p-1.5 text-slate-400 transition-colors ${
              theme === 'system' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'hover:text-slate-200'
            }`}
            title="System Theme"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

