import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  Pause,
  Play,
  CameraOff,
  Sparkles,
  RefreshCw,
  Sliders,
  Maximize,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Activity,
} from 'lucide-react';
import { DetectedObject, DetectionSettings } from '../types';
import { getObjectColor } from '../data/cocoClasses';
import { detectWithCocoSsd, isCocoModelLoaded, getOrLoadCocoModel } from '../services/cocoSsdService';

interface LiveCameraViewProps {
  settings: DetectionSettings;
  setSettings: React.Dispatch<React.SetStateAction<DetectionSettings>>;
  onCaptureFrame: (imageSrc: string) => void;
}

export const LiveCameraView: React.FC<LiveCameraViewProps> = ({
  settings,
  setSettings,
  onCaptureFrame,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [activeDetections, setActiveDetections] = useState<DetectedObject[]>([]);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const isDetectingRef = useRef<boolean>(false);

  // Discover camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (e) {
        console.warn('Could not enumerate media devices', e);
      }
    }
    getDevices();
  }, []);

  // Preload model on mount
  useEffect(() => {
    if (!isCocoModelLoaded()) {
      setIsModelLoading(true);
      getOrLoadCocoModel()
        .then(() => setIsModelLoading(false))
        .catch(() => setIsModelLoading(false));
    }
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    setPermissionError(null);
    setIsModelLoading(true);

    try {
      // Ensure model is ready
      await getOrLoadCocoModel();
      setIsModelLoading(false);

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
          setIsPaused(false);
          startDetectionLoop();
        };
      }
    } catch (err: any) {
      console.error('Camera access denied or failed:', err);
      setIsModelLoading(false);
      setIsStreaming(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(
          'Camera permission was denied. Please allow camera access in your browser settings and try again.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera device was detected on your system.');
      } else {
        setPermissionError(err.message || 'Unable to access camera feed.');
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setIsPaused(false);
    setActiveDetections([]);
    setFps(0);
    setLatencyMs(0);
  };

  // Real-time Detection Loop
  const startDetectionLoop = useCallback(() => {
    const loop = async () => {
      if (!videoRef.current || !canvasRef.current || isPaused) {
        animFrameIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= 2 && !isDetectingRef.current) {
        isDetectingRef.current = true;
        const inferStart = performance.now();

        try {
          // Detect using COCO-SSD Edge model
          const predictions = await detectWithCocoSsd(video, 0.1);
          setActiveDetections(predictions);

          // Calculate FPS & Latency
          const now = performance.now();
          const delta = now - lastFrameTimeRef.current;
          lastFrameTimeRef.current = now;
          if (delta > 0) {
            setFps(Math.round(1000 / delta));
          }
          setLatencyMs(Math.round(now - inferStart));

          // Draw Bounding Boxes on Overlay Canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const width = video.videoWidth || video.clientWidth || 640;
            const height = video.videoHeight || video.clientHeight || 480;

            if (canvas.width !== width || canvas.height !== height) {
              canvas.width = width;
              canvas.height = height;
            }

            ctx.clearRect(0, 0, width, height);

            if (settings.showBoundingBoxes) {
              const visiblePredictions = predictions.filter(
                (p) => p.confidence >= settings.confidenceThreshold
              );

              for (const pred of visiblePredictions) {
                const color = getObjectColor(pred.label);
                const bx = pred.bbox.x * width;
                const by = pred.bbox.y * height;
                const bw = pred.bbox.width * width;
                const bh = pred.bbox.height * height;

                // Fill glow
                if (settings.showFillGlow) {
                  ctx.fillStyle = color.fill;
                  ctx.fillRect(bx, by, bw, bh);
                }

                // Box stroke
                ctx.strokeStyle = color.stroke;
                ctx.lineWidth = 2.5;
                ctx.strokeRect(bx, by, bw, bh);

                // Tech corners
                const cornerSize = Math.min(14, Math.min(bw, bh) / 4);
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(bx, by + cornerSize);
                ctx.lineTo(bx, by);
                ctx.lineTo(bx + cornerSize, by);

                ctx.moveTo(bx + bw - cornerSize, by);
                ctx.lineTo(bx + bw, by);
                ctx.lineTo(bx + bw, by + cornerSize);

                ctx.moveTo(bx, by + bh - cornerSize);
                ctx.lineTo(bx, by + bh);
                ctx.lineTo(bx + cornerSize, by + bh);

                ctx.moveTo(bx + bw - cornerSize, by + bh);
                ctx.lineTo(bx + bw, by + bh);
                ctx.lineTo(bx + bw, by + bh - cornerSize);
                ctx.stroke();

                // Pill label
                if (settings.showLabels || settings.showConfidence) {
                  let tagText = '';
                  if (settings.showLabels && settings.showConfidence) {
                    tagText = `${pred.label.toUpperCase()} ${Math.round(pred.confidence * 100)}%`;
                  } else if (settings.showLabels) {
                    tagText = pred.label.toUpperCase();
                  } else {
                    tagText = `${Math.round(pred.confidence * 100)}%`;
                  }

                  ctx.font = 'bold 12px sans-serif';
                  const textMetrics = ctx.measureText(tagText);
                  const tagW = textMetrics.width + 12;
                  const tagH = 20;
                  const tagY = by - tagH < 0 ? by : by - tagH;

                  ctx.fillStyle = color.stroke;
                  ctx.fillRect(bx, tagY, tagW, tagH);

                  ctx.fillStyle = '#ffffff';
                  ctx.fillText(tagText, bx + 6, tagY + 14);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Real-time frame detection error:', e);
        } finally {
          isDetectingRef.current = false;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
  }, [isPaused, settings]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture current video frame
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const offscreen = document.createElement('canvas');
    offscreen.width = video.videoWidth || 1280;
    offscreen.height = video.videoHeight || 720;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
    const dataUrl = offscreen.toDataURL('image/jpeg', 0.95);
    onCaptureFrame(dataUrl);
  };

  const filteredDetections = activeDetections.filter(
    (d) => d.confidence >= settings.confidenceThreshold
  );

  return (
    <div id="live-camera-view" className="flex flex-1 flex-col overflow-hidden bg-[#0B0F1A] geometric-dot-grid p-6 text-slate-300">
      {/* Camera Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-lg">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isStreaming ? (
            <button
              id="start-camera-btn"
              onClick={startCamera}
              disabled={isModelLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isModelLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading Neural Model...</span>
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  <span>Start Camera Feed</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                id="stop-camera-btn"
                onClick={stopCamera}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20 cursor-pointer"
              >
                <VideoOff className="h-3.5 w-3.5" />
                <span>Stop Stream</span>
              </button>

              <button
                id="pause-resume-camera-btn"
                onClick={() => setIsPaused((p) => !p)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                <span>{isPaused ? 'Resume Stream' : 'Pause'}</span>
              </button>

              <button
                id="capture-frame-btn"
                onClick={handleCaptureFrame}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700/60 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Capture frame for high-precision analysis"
              >
                <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                <span>Capture Frame</span>
              </button>
            </>
          )}

          {/* Device selector */}
          {availableDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300"
            >
              {availableDevices.map((dev, i) => (
                <option key={dev.deviceId} value={dev.deviceId}>
                  {dev.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right HUD Metrics */}
        {isStreaming && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              <span>FPS: {fps}</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Latency: {latencyMs}ms
            </div>
            <div className="rounded-md bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-300 font-mono">
              {filteredDetections.length} Targets Live
            </div>
          </div>
        )}
      </div>

      {/* Permission / Device Error Banner */}
      {permissionError && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-900/50 bg-amber-950/40 p-4 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="leading-relaxed">{permissionError}</span>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Camera Stage Grid */}
      <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-12 min-h-0">
        {/* Main Video Viewfinder */}
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F1A] shadow-xl lg:col-span-8">
          {/* Geometric technical reticles */}
          <div className="pointer-events-none absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-blue-500/60 z-20" />
          <div className="pointer-events-none absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-500/60 z-20" />
          <div className="pointer-events-none absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-500/60 z-20" />
          <div className="pointer-events-none absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-500/60 z-20" />

          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {/* Real Web Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-contain ${isStreaming ? 'block' : 'hidden'}`}
            />

            {/* Overlay Canvas for Real-Time Bounding Boxes */}
            <canvas
              ref={canvasRef}
              className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
                isStreaming ? 'block' : 'hidden'
              }`}
            />

            {/* Offline Viewfinder Prompt */}
            {!isStreaming && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-blue-400 mb-4 border border-slate-700/60 shadow-lg">
                  <CameraOff className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white">Live Camera Feed Offline</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
                  Click 'Start Camera Feed' to initialize real-time edge neural object detection through your device webcam.
                </p>
                <button
                  onClick={startCamera}
                  disabled={isModelLoading}
                  className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  {isModelLoading ? 'Initializing Neural Engine...' : 'Grant Permission & Start'}
                </button>
              </div>
            )}

            {/* Live HUD Radar Watermark */}
            {isStreaming && (
              <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-700/60 px-3 py-1 text-[11px] font-mono text-white backdrop-blur-md z-20">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>REC // COCO-SSD MOBILENET</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Detections Monitor Column */}
        <div className="flex flex-col space-y-4 overflow-y-auto lg:col-span-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Live Active Targets ({filteredDetections.length})
              </h3>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 font-mono">
                Real-Time Inference
              </span>
            </div>

            {/* Confidence Threshold */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Live Threshold</span>
                <span className="font-bold text-blue-400 font-mono">
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
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-blue-500"
              />
            </div>

            {/* Target List */}
            {filteredDetections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {isStreaming
                  ? 'No objects detected in current frame matching threshold.'
                  : 'Start camera to see live object detections.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDetections.map((det) => {
                  const color = getObjectColor(det.label);
                  return (
                    <div
                      key={det.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color.stroke }}
                        />
                        <span className="font-bold capitalize text-white">
                          {det.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-semibold text-emerald-400">
                          {Math.round(det.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Capture helper */}
            {isStreaming && (
              <div className="border-t border-slate-800 pt-3">
                <button
                  onClick={handleCaptureFrame}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Inspect High-Res Frame</span>
                </button>
                <p className="mt-1.5 text-center text-[10px] text-slate-400">
                  Transfers active frame into Image Detector for deep inspection & export.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
