import React from 'react';
import {
  Settings,
  Sliders,
  Eye,
  Camera,
  Moon,
  Sun,
  Monitor,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { DetectionSettings, DetectionModelId } from '../types';
import { clearAllHistory } from '../services/historyService';

interface SettingsViewProps {
  settings: DetectionSettings;
  setSettings: React.Dispatch<React.SetStateAction<DetectionSettings>>;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  onHistoryCleared: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
  theme,
  setTheme,
  onHistoryCleared,
}) => {
  const handleResetSettings = () => {
    setSettings({
      confidenceThreshold: 0.5,
      defaultModel: 'gemini-3.7-flash',
      showLabels: true,
      showConfidence: true,
      showBoundingBoxes: true,
      showFillGlow: true,
      boxCornerStyle: 'tech',
      cameraFpsLimit: 30,
      cameraIntervalMs: 66,
      theme: 'system',
      maxHistoryItems: 30,
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored detection sessions from local storage?')) {
      clearAllHistory();
      onHistoryCleared();
    }
  };

  return (
    <div id="settings-view" className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl bg-[#0B0F1A] geometric-dot-grid text-slate-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Platform Settings & Preferences
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Configure model parameters, visualization overlays, camera stream bounds, and theme preferences.
        </p>
      </div>

      {/* Model & AI Settings Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            Default Detection Engine
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
              settings.defaultModel === 'gemini-3.7-flash'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Gemini 3.7 Flash Vision
              </span>
              <input
                type="radio"
                name="defaultModel"
                value="gemini-3.7-flash"
                checked={settings.defaultModel === 'gemini-3.7-flash'}
                onChange={() =>
                  setSettings((s) => ({ ...s, defaultModel: 'gemini-3.7-flash' }))
                }
                className="accent-blue-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Cloud AI multimodal engine with highest precision, open vocabulary, and scene descriptors.
            </p>
          </label>

          <label
            className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
              settings.defaultModel === 'coco-ssd-edge'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                COCO-SSD MobileNet
              </span>
              <input
                type="radio"
                name="defaultModel"
                value="coco-ssd-edge"
                checked={settings.defaultModel === 'coco-ssd-edge'}
                onChange={() =>
                  setSettings((s) => ({ ...s, defaultModel: 'coco-ssd-edge' }))
                }
                className="accent-blue-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Edge WebML neural model running locally in the browser with zero network latency.
            </p>
          </label>
        </div>

        {/* Global Confidence Threshold */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Global Default Confidence Threshold</span>
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white font-mono shadow-sm">
              {Math.round(settings.confidenceThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) =>
              setSettings((s) => ({ ...s, confidenceThreshold: parseFloat(e.target.value) }))
            }
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500"
          />
        </div>
      </div>

      {/* Overlay & Visualization Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Eye className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Overlay & Bounding Box Displays
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs cursor-pointer hover:border-slate-700">
            <div>
              <span className="font-semibold text-white">Show Class Labels</span>
              <p className="text-[11px] text-slate-400">Display name tags above bounding boxes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showLabels}
              onChange={(e) => setSettings((s) => ({ ...s, showLabels: e.target.checked }))}
              className="h-4 w-4 rounded-xs accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs cursor-pointer hover:border-slate-700">
            <div>
              <span className="font-semibold text-white">Show Confidence %</span>
              <p className="text-[11px] text-slate-400">Render precision percentage scores</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showConfidence}
              onChange={(e) => setSettings((s) => ({ ...s, showConfidence: e.target.checked }))}
              className="h-4 w-4 rounded-xs accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs cursor-pointer hover:border-slate-700">
            <div>
              <span className="font-semibold text-white">Show Bounding Boxes</span>
              <p className="text-[11px] text-slate-400">Draw spatial rectangle perimeters</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showBoundingBoxes}
              onChange={(e) => setSettings((s) => ({ ...s, showBoundingBoxes: e.target.checked }))}
              className="h-4 w-4 rounded-xs accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs cursor-pointer hover:border-slate-700">
            <div>
              <span className="font-semibold text-white">Translucent Fill Glow</span>
              <p className="text-[11px] text-slate-400">Highlight object interior with category tint</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showFillGlow}
              onChange={(e) => setSettings((s) => ({ ...s, showFillGlow: e.target.checked }))}
              className="h-4 w-4 rounded-xs accent-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Visual Theme Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Moon className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white">
            Interface Theme
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Sun className="h-5 w-5 mb-1.5" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Moon className="h-5 w-5 mb-1.5" />
            <span>Dark Mode</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Monitor className="h-5 w-5 mb-1.5" />
            <span>System Default</span>
          </button>
        </div>
      </div>

      {/* Danger Zone & Reset */}
      <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 space-y-4">
        <h2 className="text-sm font-bold text-red-300">
          Data Management & Reset
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-900/40 cursor-pointer transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Local History</span>
          </button>

          <button
            onClick={handleResetSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
