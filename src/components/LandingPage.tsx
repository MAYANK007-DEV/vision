import React from 'react';
import {
  Scan,
  Camera,
  Image as ImageIcon,
  Sliders,
  History,
  Download,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface LandingPageProps {
  onStartDetection: () => void;
  onTryDemo: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDetection,
  onTryDemo,
  setActiveTab,
}) => {
  const featureCards = [
    {
      icon: Camera,
      title: 'Real-Time Detection',
      description:
        'Continuous high-framerate object detection directly through your web camera with live bounding box rendering.',
      tag: 'Edge WebML',
      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      icon: ImageIcon,
      title: 'Image Detection',
      description:
        'Upload JPG, JPEG, PNG, or WEBP images for instant multi-object segmentation and normalized bounding box mapping.',
      tag: 'Multi-Format',
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      icon: Target,
      title: 'Multiple Object Detection',
      description:
        'Identify dozens of overlapping entities simultaneously across 80+ standard categories and open-vocabulary classes.',
      tag: 'Spatial AI',
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      icon: Sliders,
      title: 'Confidence Scores',
      description:
        'Interactive real-time confidence threshold filtering from 0% to 100% to eliminate false positives.',
      tag: 'Dynamic Filter',
      color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
    {
      icon: History,
      title: 'Detection History',
      description:
        'Session storage with thumbnails, detected classes breakdown, and complete metadata logging.',
      tag: 'Local & Private',
      color: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    },
    {
      icon: Download,
      title: 'Export Results',
      description:
        'Download high-resolution annotated images with crisp bounding box overlays, or export structured JSON and CSV reports.',
      tag: 'PNG, JSON & CSV',
      color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    },
  ];

  return (
    <div id="landing-page-view" className="flex-1 overflow-y-auto pb-16 bg-[#0B0F1A] geometric-dot-grid text-slate-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#0B0F1A]/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Next-Gen Computer Vision Platform</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                See. Detect.{' '}
                <span className="text-blue-400">
                  Understand.
                </span>
              </h1>

              <p className="max-w-2xl text-lg text-slate-300 sm:text-xl font-normal leading-relaxed">
                Detect objects in images and camera feeds using AI-powered computer vision.
                Extract real bounding boxes, precision confidence scores, and detailed spatial analytics instantly.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
                <button
                  id="landing-start-detection-btn"
                  onClick={onStartDetection}
                  className="group flex items-center gap-2.5 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:bg-blue-500 focus:outline-none cursor-pointer"
                >
                  <Scan className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Start Detection</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  id="landing-try-demo-btn"
                  onClick={onTryDemo}
                  className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/90 px-6 py-3.5 text-sm font-semibold text-slate-200 shadow-md transition-all hover:bg-slate-700 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Try Demo</span>
                </button>
              </div>

              {/* Trust & Architecture Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-400 lg:justify-start font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Real Inference (No Fake Results)
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Dual Engine (Cloud + Edge)
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-400" />
                  80+ COCO & Open Classes
                </span>
              </div>
            </div>

            {/* Right Visual HUD Simulation */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-3.5 shadow-2xl shadow-black/50">
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE_VISION_STREAM
                  </span>
                  <span>FPS: 30.2 | 96.4% CONF</span>
                </div>

                {/* Simulated Screen with Bounding Boxes */}
                <div className="relative mt-3 aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80"
                    alt="Computer Vision Sample"
                    className="h-full w-full object-cover opacity-80"
                  />

                  {/* Laser Scan line animation */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />

                  {/* Bounding Box 1: Car */}
                  <div className="absolute left-[18%] top-[45%] h-[38%] w-[35%] rounded-xs border-2 border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20">
                    <span className="absolute -top-6 left-0 rounded-xs bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-950">
                      CAR — 96%
                    </span>
                    {/* Reticles */}
                    <div className="absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2 border-amber-300" />
                    <div className="absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2 border-amber-300" />
                    <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-amber-300" />
                    <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-amber-300" />
                  </div>

                  {/* Bounding Box 2: Person */}
                  <div className="absolute left-[62%] top-[30%] h-[48%] w-[18%] rounded-xs border-2 border-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20">
                    <span className="absolute -top-6 left-0 rounded-xs bg-blue-400 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                      PERSON — 94%
                    </span>
                    <div className="absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2 border-blue-300" />
                    <div className="absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2 border-blue-300" />
                    <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-blue-300" />
                    <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-blue-300" />
                  </div>

                  {/* Bounding Box 3: Traffic Light */}
                  <div className="absolute left-[78%] top-[12%] h-[24%] w-[12%] rounded-xs border-2 border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20">
                    <span className="absolute -top-6 left-0 rounded-xs bg-cyan-400 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-950">
                      LIGHT — 91%
                    </span>
                  </div>

                  {/* Target Crosshair */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 rounded-full border border-dashed border-blue-400/60 animate-spin" />
                  </div>
                </div>

                {/* HUD Footer */}
                <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-slate-400 font-mono">
                  <span>OBJECTS: 5 DETECTED</span>
                  <span>NEURAL_LATENCY: 28ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Steps */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            Pipeline Architecture
          </h2>
          <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Real Computer Vision Workflow
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { step: '01', title: 'Upload / Camera', desc: 'Select image or activate camera feed' },
            { step: '02', title: 'Neural Inference', desc: 'Execute real computer vision model' },
            { step: '03', title: 'Bounding Boxes', desc: 'Compute normalized spatial coordinates' },
            { step: '04', title: 'Labels & Scores', desc: 'Assign class taxonomy and confidence' },
            { step: '05', title: 'Deep Analytics', desc: 'Aggregate metrics & distribution' },
            { step: '06', title: 'Export & Share', desc: 'Download PNG overlays, JSON & CSV' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border border-slate-800 bg-[#111827] p-4 text-center shadow-md hover:border-slate-700 transition-all"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs font-bold text-blue-400 mb-2 font-mono">
                {item.step}
              </div>
              <h3 className="text-xs font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            Engine Capabilities
          </h2>
          <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Built for Real-World Computer Vision
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg transition-all hover:border-blue-500/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-slate-800 border border-slate-700/60 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 font-mono">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Launch Bottom Bar */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-8 text-white shadow-xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl text-white">Ready to detect objects with AI?</h2>
              <p className="mt-1 text-sm text-slate-300">
                Upload your first image or connect your device camera in seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStartDetection}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all cursor-pointer"
              >
                Open Image Detector
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Launch Live Camera
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
