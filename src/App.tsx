import React, { useState, useEffect } from 'react';
import {
  TabType,
  DetectionModelId,
  DetectionSettings,
  DetectionResult,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { ImageDetectionView } from './components/ImageDetectionView';
import { LiveCameraView } from './components/LiveCameraView';
import { AnalyticsView } from './components/AnalyticsView';
import { DetectionHistoryView } from './components/DetectionHistoryView';
import { SettingsView } from './components/SettingsView';
import { SupportedClassesModal } from './components/SupportedClassesModal';
import { ModelInfoModal } from './components/ModelInfoModal';
import { getDetectionHistory } from './services/historyService';

const SETTINGS_STORAGE_KEY = 'visiondetect_ai_settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [selectedModel, setSelectedModel] = useState<DetectionModelId>('gemini-3.7-flash');
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  // Modals
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [isModelInfoModalOpen, setIsModelInfoModalOpen] = useState(false);

  // Settings State with LocalStorage backup
  const [settings, setSettings] = useState<DetectionSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved settings', e);
    }
    return {
      confidenceThreshold: 0.5,
      defaultModel: 'gemini-3.7-flash',
      showLabels: true,
      showConfidence: true,
      showBoundingBoxes: true,
      showFillGlow: true,
      boxCornerStyle: 'tech',
      cameraFpsLimit: 30,
      cameraIntervalMs: 66,
      theme: 'dark',
      maxHistoryItems: 30,
    };
  });

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(settings.theme || 'dark');

  // Load history on mount
  const refreshHistory = () => {
    setHistory(getDetectionHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Sync theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  // Handle transfer frame from live camera to image tab
  const handleCaptureFrame = (frameDataUrl: string) => {
    setActiveTab('image');
  };

  // Inspect existing detection from history in canvas
  const handleInspectInCanvas = (result: DetectionResult) => {
    setActiveTab('image');
  };

  const handleTryDemoFromLanding = (demoId?: string) => {
    if (demoId) setSelectedDemoId(demoId);
    setActiveTab('image');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-900 antialiased dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenClassesModal={() => setIsClassesModalOpen(true)}
        onOpenModelInfoModal={() => setIsModelInfoModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          theme={theme}
          setTheme={(t) => {
            setTheme(t);
            setSettings((s) => ({ ...s, theme: t }));
          }}
          onOpenClassesModal={() => setIsClassesModalOpen(true)}
          onOpenModelInfoModal={() => setIsModelInfoModalOpen(true)}
        />

        {/* Dynamic View Router */}
        <main className="relative flex flex-1 overflow-hidden">
          {activeTab === 'landing' && (
            <LandingPage
              onStartDetection={() => setActiveTab('image')}
              onTryDemo={handleTryDemoFromLanding}
              onOpenLiveCamera={() => setActiveTab('camera')}
              onOpenClassesModal={() => setIsClassesModalOpen(true)}
              onOpenModelInfoModal={() => setIsModelInfoModalOpen(true)}
            />
          )}

          {activeTab === 'image' && (
            <ImageDetectionView
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              settings={settings}
              setSettings={setSettings}
              onHistoryUpdated={refreshHistory}
              initialDemoId={selectedDemoId}
            />
          )}

          {activeTab === 'camera' && (
            <LiveCameraView
              settings={settings}
              setSettings={setSettings}
              onCaptureFrame={handleCaptureFrame}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              history={history}
              onOpenImageTab={() => setActiveTab('image')}
            />
          )}

          {activeTab === 'history' && (
            <DetectionHistoryView
              history={history}
              onHistoryUpdated={refreshHistory}
              onInspectInCanvas={handleInspectInCanvas}
              onOpenImageTab={() => setActiveTab('image')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              setSettings={setSettings}
              theme={theme}
              setTheme={(t) => {
                setTheme(t);
                setSettings((s) => ({ ...s, theme: t }));
              }}
              onHistoryCleared={refreshHistory}
            />
          )}
        </main>
      </div>

      {/* Global Information Modals */}
      <SupportedClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
      />

      <ModelInfoModal
        isOpen={isModelInfoModalOpen}
        onClose={() => setIsModelInfoModalOpen(false)}
      />
    </div>
  );
}
