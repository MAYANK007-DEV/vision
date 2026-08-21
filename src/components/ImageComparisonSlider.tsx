import React, { useState, useRef, useEffect } from 'react';
import { Columns2, SlidersHorizontal, Eye } from 'lucide-react';
import { DetectedObject } from '../types';
import { getObjectColor } from '../data/cocoClasses';

interface ImageComparisonSliderProps {
  imageSrc: string;
  objects: DetectedObject[];
  confidenceThreshold: number;
  showLabels: boolean;
  showConfidence: boolean;
  showBoundingBoxes: boolean;
  showFillGlow: boolean;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  imageSrc,
  objects,
  confidenceThreshold,
  showLabels,
  showConfidence,
  showBoundingBoxes,
  showFillGlow,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredObjects = objects.filter((o) => o.confidence >= confidenceThreshold);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Eye className="h-4 w-4 text-blue-400" />
          <span>Visual Comparison Mode</span>
        </div>

        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          <button
            onClick={() => setMode('slider')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'slider'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            onClick={() => setMode('side-by-side')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {mode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative aspect-16/10 w-full select-none overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 cursor-ew-resize shadow-2xl"
        >
          {/* Base: Annotated Image Layer */}
          <div className="absolute inset-0 h-full w-full">
            <img src={imageSrc} alt="Annotated Base" className="h-full w-full object-contain" />

            {/* Bounding box layer */}
            {showBoundingBoxes &&
              filteredObjects.map((obj) => {
                const color = getObjectColor(obj.label, obj.category);
                return (
                  <div
                    key={obj.id}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${obj.bbox.x * 100}%`,
                      top: `${obj.bbox.y * 100}%`,
                      width: `${obj.bbox.width * 100}%`,
                      height: `${obj.bbox.height * 100}%`,
                      borderColor: color.stroke,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      backgroundColor: showFillGlow ? color.fill : 'transparent',
                    }}
                  >
                    {(showLabels || showConfidence) && (
                      <span
                        className="absolute -top-5 left-0 whitespace-nowrap rounded-xs px-1 py-0.5 text-[9px] font-bold text-white shadow-xs font-mono"
                        style={{ backgroundColor: color.stroke }}
                      >
                        {showLabels && obj.label.toUpperCase()}{' '}
                        {showConfidence && `${Math.round(obj.confidence * 100)}%`}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Top: Original Raw Image Layer clipped by slider percentage */}
          <div
            className="absolute inset-0 h-full w-full overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative h-full w-[100vw] max-w-none">
              <img
                src={imageSrc}
                alt="Original Raw"
                className="h-full object-contain"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                }}
              />
            </div>
            {/* Original label tag */}
            <div className="absolute left-3 top-3 rounded-md bg-black/80 border border-slate-700/60 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs font-mono">
              Original Image
            </div>
          </div>

          {/* Annotated label tag on right side */}
          <div className="absolute right-3 top-3 rounded-md bg-blue-600/90 border border-blue-400/40 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs font-mono">
            Detected AI
          </div>

          {/* Slider Line Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white shadow-xl border border-blue-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Original */}
          <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <img src={imageSrc} alt="Original Raw" className="h-full w-full object-contain" />
            <div className="absolute left-2.5 top-2.5 rounded-md bg-black/80 border border-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs font-mono">
              Original Raw
            </div>
          </div>

          {/* Annotated */}
          <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <img src={imageSrc} alt="Annotated" className="h-full w-full object-contain" />
            {showBoundingBoxes &&
              filteredObjects.map((obj) => {
                const color = getObjectColor(obj.label, obj.category);
                return (
                  <div
                    key={obj.id}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${obj.bbox.x * 100}%`,
                      top: `${obj.bbox.y * 100}%`,
                      width: `${obj.bbox.width * 100}%`,
                      height: `${obj.bbox.height * 100}%`,
                      borderColor: color.stroke,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      backgroundColor: showFillGlow ? color.fill : 'transparent',
                    }}
                  >
                    {(showLabels || showConfidence) && (
                      <span
                        className="absolute -top-5 left-0 whitespace-nowrap rounded-xs px-1 py-0.5 text-[9px] font-bold text-white shadow-xs font-mono"
                        style={{ backgroundColor: color.stroke }}
                      >
                        {showLabels && obj.label.toUpperCase()}{' '}
                        {showConfidence && `${Math.round(obj.confidence * 100)}%`}
                      </span>
                    )}
                  </div>
                );
              })}
            <div className="absolute left-2.5 top-2.5 rounded-md bg-blue-600/90 border border-blue-400/40 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs font-mono">
              AI Annotated ({filteredObjects.length} Objects)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
