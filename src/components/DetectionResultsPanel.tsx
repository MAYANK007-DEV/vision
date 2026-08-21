import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Sliders,
  Download,
  FileJson,
  FileSpreadsheet,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Target,
  Maximize2,
  Tag,
  Info,
} from 'lucide-react';
import { DetectedObject, DetectionResult } from '../types';
import { getObjectColor } from '../data/cocoClasses';

interface DetectionResultsPanelProps {
  result: DetectionResult | null;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onDownloadImage: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const DetectionResultsPanel: React.FC<DetectionResultsPanelProps> = ({
  result,
  confidenceThreshold,
  setConfidenceThreshold,
  selectedObjectId,
  onSelectObject,
  onDownloadImage,
  onExportJSON,
  onExportCSV,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  if (!result || !result.objects) {
    return (
      <div
        id="detection-results-empty"
        className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 mb-3 border border-blue-500/30">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-200">No Detections Yet</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
          Upload an image, try a sample demo, or run the live camera to inspect real neural bounding boxes.
        </p>
      </div>
    );
  }

  // Filter objects by confidence threshold
  const activeObjects = result.objects.filter((obj) => obj.confidence >= confidenceThreshold);

  // Group by class label
  const groupedClasses: Record<string, DetectedObject[]> = {};
  for (const obj of activeObjects) {
    const key = obj.label.toLowerCase();
    if (!groupedClasses[key]) groupedClasses[key] = [];
    groupedClasses[key].push(obj);
  }

  const uniqueClassesCount = Object.keys(groupedClasses).length;
  const totalObjectsCount = activeObjects.length;

  const avgConfidence =
    totalObjectsCount > 0
      ? (activeObjects.reduce((acc, curr) => acc + curr.confidence, 0) / totalObjectsCount) * 100
      : 0;

  const highestConfidence =
    totalObjectsCount > 0
      ? Math.max(...activeObjects.map((o) => o.confidence)) * 100
      : 0;

  const toggleClassExpand = (lbl: string) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [lbl]: prev[lbl] === undefined ? false : !prev[lbl],
    }));
  };

  const copySummary = () => {
    const summaryText = `VisionDetect AI Analysis Summary
Model: ${result.modelUsed} (${result.modelType})
Timestamp: ${result.timestamp}
Total Detected: ${totalObjectsCount} objects
Unique Classes: ${uniqueClassesCount}
Average Confidence: ${avgConfidence.toFixed(1)}%
Highest Confidence: ${highestConfidence.toFixed(1)}%
Class Breakdown:
${Object.entries(groupedClasses)
  .map(([cls, objs]) => ` - ${cls.toUpperCase()}: ${objs.length} found (${objs.map((o) => Math.round(o.confidence * 100) + '%').join(', ')})`)
  .join('\n')}
`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div
      id="detection-results-panel"
      className="flex h-full flex-col space-y-4 overflow-y-auto"
    >
      {/* Top Summary Card */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Detection Summary</h2>
          </div>
          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30 font-mono">
            {result.inferenceTimeMs}ms Latency
          </span>
        </div>

        {result.sceneDescription && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border-l-2 border-blue-500">
            <span className="font-semibold text-white">Context: </span>
            {result.sceneDescription}
          </p>
        )}

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Targets</div>
            <div className="mt-0.5 text-xl font-bold text-white">
              {totalObjectsCount}
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              {result.rawCount - totalObjectsCount > 0 ? `${result.rawCount - totalObjectsCount} filtered` : 'All visible'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unique Classes</div>
            <div className="mt-0.5 text-xl font-bold text-blue-400">
              {uniqueClassesCount}
            </div>
            <div className="text-[9px] text-slate-400 font-mono">Categories</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Confidence</div>
            <div className="mt-0.5 text-xl font-bold text-emerald-400">
              {avgConfidence.toFixed(0)}%
            </div>
            <div className="text-[9px] text-slate-400 font-mono">Mean Precision</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Peak Score</div>
            <div className="mt-0.5 text-xl font-bold text-indigo-400">
              {highestConfidence.toFixed(0)}%
            </div>
            <div className="text-[9px] text-slate-400 font-mono">Peak Signal</div>
          </div>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-400" />
              <span>Confidence Threshold</span>
            </div>
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white font-mono">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>

          <input
            id="confidence-threshold-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-blue-500"
          />

          <div className="mt-1 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0% (Show All)</span>
            <span>50%</span>
            <span>100% (Strict)</span>
          </div>
        </div>
      </div>

      {/* Grouped Detected Classes List */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Detected Entities ({totalObjectsCount})</span>
          <span className="text-[10px] lowercase font-normal text-slate-400">Click to highlight</span>
        </div>

        {totalObjectsCount === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-400">
            No objects meet the {Math.round(confidenceThreshold * 100)}% threshold. Lower the slider to reveal lower-confidence detections.
          </div>
        ) : (
          Object.entries(groupedClasses).map(([label, objects]) => {
            const color = getObjectColor(label, objects[0]?.category);
            const isExpanded = expandedClasses[label] !== false; // default open

            return (
              <div
                key={label}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-all"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleClassExpand(label)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color.stroke }}
                    />
                    <span className="text-xs font-bold text-white capitalize">
                      {label}
                    </span>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700 font-mono">
                      {objects.length} found
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <span className="font-mono">
                      {objects.map((o) => `${Math.round(o.confidence * 100)}%`).join(', ')}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                {/* Individual Objects in Group */}
                {isExpanded && (
                  <div className="divide-y divide-slate-800/60 border-t border-slate-800/80 bg-slate-950/60">
                    {objects.map((obj, idx) => {
                      const isSelected = selectedObjectId === obj.id;

                      return (
                        <div
                          key={obj.id}
                          onClick={() => onSelectObject(isSelected ? null : obj.id)}
                          className={`cursor-pointer px-3.5 py-2 text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-200 border-l-2 border-blue-500'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                              <span className="font-semibold text-white">{Math.round(obj.confidence * 100)}% Confidence</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{Math.round(obj.bbox.x * 100)}%, {Math.round(obj.bbox.y * 100)}%]
                            </span>
                          </div>

                          {obj.attributes && (
                            <p className="mt-0.5 text-[11px] text-slate-400 italic">
                              "{obj.attributes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Export & Actions Section */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Export Analysis & Annotations
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="export-annotated-image-btn"
            onClick={onDownloadImage}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Save Image</span>
          </button>

          <button
            id="export-copy-summary-btn"
            onClick={copySummary}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            id="export-json-btn"
            onClick={onExportJSON}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={onExportCSV}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
