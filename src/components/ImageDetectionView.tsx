import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Sliders,
  Eye,
  EyeOff,
  Columns,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DetectedObject,
  DetectionResult,
  DetectionModelId,
  DetectionSettings,
} from '../types';
import { DEMO_SAMPLES, DemoSample } from '../data/demoData';
import { getObjectColor } from '../data/cocoClasses';
import { detectWithGemini } from '../services/geminiDetectionService';
import { detectWithCocoSsd } from '../services/cocoSsdService';
import { DetectionResultsPanel } from './DetectionResultsPanel';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import {
  downloadAnnotatedImage,
  exportDetectionJSON,
  exportDetectionCSV,
} from '../services/exportService';
import { saveDetectionToHistory } from '../services/historyService';

interface ImageDetectionViewProps {
  selectedModel: DetectionModelId;
  setSelectedModel: (model: DetectionModelId) => void;
  settings: DetectionSettings;
  setSettings: React.Dispatch<React.SetStateAction<DetectionSettings>>;
  onHistoryUpdated: () => void;
  initialDemoId?: string | null;
}

export const ImageDetectionView: React.FC<ImageDetectionViewProps> = ({
  selectedModel,
  setSelectedModel,
  settings,
  setSettings,
  onHistoryUpdated,
  initialDemoId,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('sample-image.jpg');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // View modes: 'canvas' | 'compare'
  const [viewMode, setViewMode] = useState<'canvas' | 'compare'>('canvas');
  const [zoomLevel, setZoomLevel] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial demo if provided
  useEffect(() => {
    if (initialDemoId) {
      const demo = DEMO_SAMPLES.find((d) => d.id === initialDemoId) || DEMO_SAMPLES[0];
      handleSelectDemo(demo);
    } else if (!imageSrc) {
      // Default to the first demo sample
      handleSelectDemo(DEMO_SAMPLES[0]);
    }
  }, [initialDemoId]);

  // Handle image file selection
  const handleFileChange = (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    // Size limit check (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 25MB. Please upload a smaller image.');
      return;
    }

    setErrorMessage(null);
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setImageSrc(base64Url);
      setActiveResult(null);
      setSelectedObjectId(null);

      // Load dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = base64Url;
    };
    reader.readAsDataURL(file);
  };

  // Handle Demo Sample click
  const handleSelectDemo = (demo: DemoSample) => {
    setErrorMessage(null);
    setImageName(`${demo.title.toLowerCase().replace(/\s+/g, '-')}.jpg`);
    setImageSrc(demo.imageUrl);
    setActiveResult(null);
    setSelectedObjectId(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = demo.imageUrl;
  };

  // Run real Object Detection
  const handleRunDetection = async () => {
    if (!imageSrc) {
      setErrorMessage('Please upload or select an image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      let detectedObjects: DetectedObject[] = [];
      let sceneDesc = '';
      let modelUsedName = '';
      let modelTypeName = '';

      if (selectedModel === 'gemini-3.7-flash') {
        modelUsedName = 'Gemini 3.7 Flash';
        modelTypeName = 'Cloud Multimodal Transformer';

        // Ensure base64 string
        let base64Payload = imageSrc;
        if (imageSrc.startsWith('http')) {
          // Fetch and convert remote image to base64
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          base64Payload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }

        const geminiRes = await detectWithGemini(base64Payload, 'image/jpeg', 0.1);
        detectedObjects = geminiRes.objects;
        sceneDesc = geminiRes.sceneDescription;
      } else {
        // COCO-SSD In-Browser WebML
        modelUsedName = 'COCO-SSD MobileNet v2';
        modelTypeName = 'In-Browser WebGL Edge ML';

        // Use the rendered image element
        if (!imageElementRef.current) {
          throw new Error('Image element not ready for edge detection');
        }

        detectedObjects = await detectWithCocoSsd(imageElementRef.current, 0.1);
        sceneDesc = `Detected ${detectedObjects.length} standard COCO classes using local on-device neural network.`;
      }

      const inferenceTimeMs = Math.round(performance.now() - startTime);

      const result: DetectionResult = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        imageUrl: imageSrc,
        imageName: imageName,
        modelUsed: modelUsedName,
        modelType: modelTypeName,
        inferenceTimeMs,
        sceneDescription: sceneDesc,
        objects: detectedObjects,
        rawCount: detectedObjects.length,
        imageDimensions,
      };

      setActiveResult(result);
      saveDetectionToHistory(result);
      onHistoryUpdated();
    } catch (err: any) {
      console.error('Detection failure:', err);
      setErrorMessage(err.message || 'Detection failed. Please check network or try Edge model.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset / Clear
  const handleReset = () => {
    setActiveResult(null);
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setZoomLevel(1);
  };

  // Download annotated image
  const handleDownloadImage = () => {
    if (!imageSrc || !activeResult) return;
    downloadAnnotatedImage(imageSrc, activeResult.objects, {
      showLabels: settings.showLabels,
      showConfidence: settings.showConfidence,
      showBoundingBoxes: settings.showBoundingBoxes,
      showFillGlow: settings.showFillGlow,
      threshold: settings.confidenceThreshold,
    });
  };

  // Filtered objects based on settings threshold
  const visibleObjects = (activeResult?.objects || []).filter(
    (obj) => obj.confidence >= settings.confidenceThreshold
  );

  return (
    <div id="image-detection-view" className="flex flex-1 flex-col overflow-hidden bg-[#0B0F1A] text-slate-300 p-4 sm:p-6 space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#111827]/70 p-3 backdrop-blur-md">
        {/* Left: Model & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Model:</span>
            <select
              id="image-model-selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as DetectionModelId)}
              aria-label="Object Detection Engine"
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="gemini-3.7-flash" className="bg-slate-900 text-white">Gemini 3.7 Flash (Cloud Vision AI)</option>
              <option value="coco-ssd-edge" className="bg-slate-900 text-white">COCO-SSD MobileNet (Edge WebML)</option>
            </select>
          </div>

          <button
            id="run-image-detection-btn"
            onClick={handleRunDetection}
            disabled={isProcessing || !imageSrc}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Neural Inference Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Detection</span>
              </>
            )}
          </button>

          {activeResult && (
            <button
              id="reset-detection-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: View & Overlay Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
            <button
              id="viewmode-canvas-btn"
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'canvas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize className="h-3.5 w-3.5" />
              <span>Canvas</span>
            </button>
            <button
              id="viewmode-compare-btn"
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'compare'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Compare</span>
            </button>
          </div>

          {/* Quick Display Toggles */}
          <button
            onClick={() => setSettings((s) => ({ ...s, showLabels: !s.showLabels }))}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              settings.showLabels
                ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Labels"
          >
            Labels
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, showConfidence: !s.showConfidence }))}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              settings.showConfidence
                ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Confidence %"
          >
            Confidence %
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, showBoundingBoxes: !s.showBoundingBoxes }))}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              settings.showBoundingBoxes
                ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Bounding Boxes"
          >
            Boxes
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Layout: Canvas on Left, Results on Right */}
      <div className="grid flex-1 gap-5 overflow-hidden lg:grid-cols-12">
        {/* Left Column: Image Canvas & Demo selector */}
        <div className="flex flex-col space-y-4 overflow-y-auto lg:col-span-8">
          {/* Canvas Card with Geometric Balance Frame */}
          <div
            ref={containerRef}
            className="relative flex flex-1 min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-2xl"
          >
            {/* Geometric Dot Grid Backdrop */}
            <div className="geometric-dot-grid absolute inset-0 opacity-20 pointer-events-none" />

            {/* Geometric 4-Corner Reticles */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-slate-700 opacity-50 pointer-events-none" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-slate-700 opacity-50 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-slate-700 opacity-50 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-slate-700 opacity-50 pointer-events-none" />

            {imageSrc ? (
              viewMode === 'compare' && activeResult ? (
                <div className="relative z-10 w-full p-2">
                  <ImageComparisonSlider
                    imageSrc={imageSrc}
                    objects={activeResult.objects}
                    confidenceThreshold={settings.confidenceThreshold}
                    showLabels={settings.showLabels}
                    showConfidence={settings.showConfidence}
                    showBoundingBoxes={settings.showBoundingBoxes}
                    showFillGlow={settings.showFillGlow}
                  />
                </div>
              ) : (
                /* Standard Interactive Canvas Overlay */
                <div
                  className="relative z-10 flex max-h-[580px] w-full items-center justify-center overflow-hidden p-2"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                >
                  <div className="relative inline-block max-w-full rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                    {/* Base Image */}
                    <img
                      ref={imageElementRef}
                      src={imageSrc}
                      alt="Uploaded image for detection"
                      crossOrigin="anonymous"
                      className="max-h-[520px] w-auto max-w-full object-contain select-none"
                    />

                    {/* Laser scanning animation during inference */}
                    {isProcessing && (
                      <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <div className="h-full w-full bg-blue-500/10 animate-pulse" />
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[bounce_2s_infinite]" />
                      </div>
                    )}

                    {/* Precision Bounding Boxes Overlay */}
                    {settings.showBoundingBoxes &&
                      visibleObjects.map((obj) => {
                        const color = getObjectColor(obj.label, obj.category);
                        const isSelected = selectedObjectId === obj.id;
                        const isHovered = hoveredObjectId === obj.id;

                        return (
                          <div
                            key={obj.id}
                            id={`bbox-${obj.id}`}
                            onMouseEnter={() => setHoveredObjectId(obj.id)}
                            onMouseLeave={() => setHoveredObjectId(null)}
                            onClick={() => setSelectedObjectId(isSelected ? null : obj.id)}
                            className="group absolute cursor-pointer transition-all duration-150"
                            style={{
                              left: `${obj.bbox.x * 100}%`,
                              top: `${obj.bbox.y * 100}%`,
                              width: `${obj.bbox.width * 100}%`,
                              height: `${obj.bbox.height * 100}%`,
                              borderColor: color.stroke,
                              borderWidth: isSelected || isHovered ? '3px' : '2px',
                              borderStyle: 'solid',
                              backgroundColor:
                                settings.showFillGlow || isSelected || isHovered
                                  ? isSelected
                                    ? 'rgba(59, 130, 246, 0.35)'
                                    : color.fill
                                  : 'transparent',
                              boxShadow:
                                isSelected || isHovered
                                  ? `0 0 15px ${color.stroke}`
                                  : `0 0 10px ${color.fill}`,
                              zIndex: isSelected ? 30 : isHovered ? 20 : 10,
                            }}
                          >
                            {/* Tech Reticles */}
                            <div
                              className="absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2"
                              style={{ borderColor: color.stroke }}
                            />
                            <div
                              className="absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2"
                              style={{ borderColor: color.stroke }}
                            />
                            <div
                              className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2"
                              style={{ borderColor: color.stroke }}
                            />
                            <div
                              className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2"
                              style={{ borderColor: color.stroke }}
                            />

                            {/* Label Pill Badge */}
                            {(settings.showLabels || settings.showConfidence) && (
                              <div
                                className="absolute top-0 left-0 flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md rounded-br"
                                style={{ backgroundColor: color.stroke }}
                              >
                                {settings.showLabels && <span>{obj.label.toUpperCase()}</span>}
                                {settings.showConfidence && (
                                  <span className="opacity-90">
                                    {Math.round(obj.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Tooltip on Hover */}
                            {isHovered && (
                              <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2.5 py-1 text-[10px] text-white shadow-xl backdrop-blur-xs z-40 border border-slate-700">
                                <div>
                                  <span className="font-bold capitalize">{obj.label}</span> —{' '}
                                  <span className="text-emerald-400 font-mono">
                                    {(obj.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                                {obj.attributes && (
                                  <div className="text-[9px] text-slate-400">{obj.attributes}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )
            ) : (
              /* Empty Dropzone State */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                className="relative z-10 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 mb-4 border border-blue-500/30 shadow-lg shadow-blue-900/20">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Upload Image for Neural Detection</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
                  Drag and drop JPG, PNG, WEBP files up to 25MB, or select one from your device.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all cursor-pointer"
                >
                  Select Image File
                </button>
              </div>
            )}

            {/* Bottom Floating Canvas Controls */}
            {imageSrc && viewMode === 'canvas' && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg bg-slate-950/85 p-1 backdrop-blur-md border border-slate-800 text-white z-20 shadow-lg">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="rounded-md p-1.5 hover:bg-slate-800 text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="px-1 text-[10px] font-mono text-slate-300">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="rounded-md p-1.5 hover:bg-slate-800 text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="rounded-md px-2 py-1 text-[10px] hover:bg-slate-800 font-mono text-slate-300"
                  title="Fit to Screen"
                >
                  Fit
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />

          {/* Sample Demo Gallery Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Curated Test Scenes
                </h3>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Upload Custom Image
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {DEMO_SAMPLES.map((demo) => {
                const isSelected = imageSrc === demo.imageUrl;
                return (
                  <div
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`group cursor-pointer rounded-xl border p-1.5 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/10 shadow-md shadow-blue-900/20'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-950">
                      <img
                        src={demo.imageUrl}
                        alt={demo.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-1.5 px-0.5 pb-0.5">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {demo.title}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate font-mono">
                        {demo.expectedObjects.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detection Results Panel */}
        <div className="lg:col-span-4 h-full min-h-[480px]">
          <DetectionResultsPanel
            result={activeResult}
            confidenceThreshold={settings.confidenceThreshold}
            setConfidenceThreshold={(val) => setSettings((s) => ({ ...s, confidenceThreshold: val }))}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            onDownloadImage={handleDownloadImage}
            onExportJSON={() => activeResult && exportDetectionJSON(activeResult)}
            onExportCSV={() => activeResult && exportDetectionCSV(activeResult)}
          />
        </div>
      </div>
    </div>
  );
};
