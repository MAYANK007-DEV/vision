import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { DetectionResult } from '../types';
import { clearAllHistory, deleteHistoryItem } from '../services/historyService';
import {
  downloadAnnotatedImage,
  exportDetectionJSON,
  exportDetectionCSV,
} from '../services/exportService';
import { getObjectColor } from '../data/cocoClasses';

interface DetectionHistoryViewProps {
  history: DetectionResult[];
  onHistoryUpdated: () => void;
  onInspectInCanvas: (result: DetectionResult) => void;
  onOpenImageTab: () => void;
}

export const DetectionHistoryView: React.FC<DetectionHistoryViewProps> = ({
  history,
  onHistoryUpdated,
  onInspectInCanvas,
  onOpenImageTab,
}) => {
  const [selectedResult, setSelectedResult] = useState<DetectionResult | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    onHistoryUpdated();
    if (selectedResult?.id === id) setSelectedResult(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all detection history?')) {
      clearAllHistory();
      onHistoryUpdated();
      setSelectedResult(null);
    }
  };

  return (
    <div id="detection-history-view" className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F1A] geometric-dot-grid text-slate-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Detection History & Logs
            </h1>
            <span className="rounded-md bg-slate-800 border border-slate-700/60 px-2.5 py-0.5 text-xs font-bold text-slate-300 font-mono">
              {history.length} Sessions
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Locally saved detection scans with full spatial metadata and bounding coordinates.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/30 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-300">
        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
        <span>
          <strong className="text-white">Privacy Safeguard:</strong> All session records are stored entirely in your local browser sandbox. Images are never retained on any cloud database without your explicit action.
        </span>
      </div>

      {/* History Grid */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#111827] p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 mb-3 border border-blue-500/30">
            <History className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Detection Records Found</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            When you run object detections on images or live video captures, they will be archived here for inspection and export.
          </p>
          <button
            onClick={onOpenImageTab}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Start Image Detection
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => {
            const avgConf =
              item.objects.length > 0
                ? (item.objects.reduce((acc, curr) => acc + curr.confidence, 0) / item.objects.length) * 100
                : 0;

            // Most common class
            const classCounts: Record<string, number> = {};
            for (const o of item.objects) {
              classCounts[o.label] = (classCounts[o.label] || 0) + 1;
            }
            const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedResult(item)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-lg transition-all hover:border-blue-500/50"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.imageName || 'Scan thumbnail'}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <Layers className="h-8 w-8" />
                    </div>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-2 left-2 rounded-md bg-black/80 border border-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs font-mono">
                    {item.modelUsed}
                  </div>

                  {/* Objects Count Badge */}
                  <div className="absolute bottom-2 right-2 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg font-mono">
                    {item.objects.length} Objects
                  </div>
                </div>

                {/* Body Details */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[180px]">
                      {item.imageName || 'Unnamed Scan'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Top: <strong className="capitalize text-slate-200">{topClass}</strong>
                    </span>
                    <span>Avg: <strong className="text-emerald-400">{avgConf.toFixed(0)}%</strong></span>
                  </div>

                  {/* Classes tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.objects.slice(0, 4).map((obj, i) => {
                      const color = getObjectColor(obj.label);
                      return (
                        <span
                          key={i}
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold font-mono"
                          style={{
                            backgroundColor: color.fill,
                            color: color.stroke,
                          }}
                        >
                          {obj.label}
                        </span>
                      );
                    })}
                    {item.objects.length > 4 && (
                      <span className="rounded-md bg-slate-800 border border-slate-700/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-300 font-mono">
                        +{item.objects.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Quick Actions */}
                <div className="mt-3.5 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectInCanvas(item);
                    }}
                    className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAnnotatedImage(item.imageUrl, item.objects);
                      }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Download Annotated Image"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Full History Item Details */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#111827] border border-slate-800 p-6 shadow-2xl text-slate-300">
            <button
              onClick={() => setSelectedResult(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-white">
                Scan Details: {selectedResult.imageName}
              </h2>
            </div>

            {/* Preview image */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 mb-4">
              <img
                src={selectedResult.imageUrl}
                alt="Selected result"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Objects table */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Localized Objects ({selectedResult.objects.length})
              </h3>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60">
                {selectedResult.objects.map((obj, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold capitalize text-white">
                        {obj.label}
                      </span>
                      {obj.attributes && (
                        <span className="text-[11px] text-slate-400 italic">
                          ({obj.attributes})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-emerald-400 font-semibold">
                        {Math.round(obj.confidence * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        [{obj.bbox.x.toFixed(2)}, {obj.bbox.y.toFixed(2)}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => {
                  onInspectInCanvas(selectedResult);
                  setSelectedResult(null);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors cursor-pointer"
              >
                Inspect in Active Canvas
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadAnnotatedImage(selectedResult.imageUrl, selectedResult.objects)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Image</span>
                </button>
                <button
                  onClick={() => exportDetectionJSON(selectedResult)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <FileJson className="h-3.5 w-3.5 text-amber-400" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportDetectionCSV(selectedResult)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
