import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Layers,
  Percent,
  Cpu,
  History,
  ArrowUpRight,
} from 'lucide-react';
import { DetectionResult } from '../types';
import { computeAnalyticsSummary } from '../services/historyService';
import { getObjectColor } from '../data/cocoClasses';

interface AnalyticsViewProps {
  history: DetectionResult[];
  onOpenImageTab: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history, onOpenImageTab }) => {
  const summary = computeAnalyticsSummary(history);

  const sortedClasses = Object.entries(summary.classDistribution).sort(
    (a, b) => b[1] - a[1]
  );
  const maxClassCount = sortedClasses.length > 0 ? sortedClasses[0][1] : 1;

  const totalBucketsCount = Object.values(summary.confidenceBuckets).reduce(
    (acc, val) => acc + val,
    0
  );

  return (
    <div id="analytics-view" className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F1A] geometric-dot-grid text-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Computer Vision Analytics
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Aggregated statistical performance and entity frequency across all detection sessions.
          </p>
        </div>

        <button
          onClick={onOpenImageTab}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <span>Run New Detection</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Scans Run</span>
            <History className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {summary.totalScans}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Recorded sessions</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Entities Localized</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {summary.totalObjectsDetected}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Bounding boxes drawn</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Confidence</span>
            <Percent className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-400">
            {(summary.averageConfidence * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Model precision score</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Most Detected Class</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white capitalize truncate">
            {summary.topClass ? summary.topClass.label : 'None'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            {summary.topClass ? `${summary.topClass.count} instances` : '0 detections'}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Class Frequency Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Most Detected Object Classes
              </h2>
              <p className="text-xs text-slate-400">
                Frequency rank by localized instances
              </p>
            </div>
            <span className="rounded-md bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-slate-300 font-mono">
              {sortedClasses.length} Unique Classes
            </span>
          </div>

          {sortedClasses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No detection data available yet. Run a detection scan to populate analytics.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {sortedClasses.slice(0, 8).map(([label, count]) => {
                const color = getObjectColor(label);
                const percentage = Math.round((count / maxClassCount) * 100);

                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color.stroke }}
                        />
                        <span className="font-bold capitalize text-white">
                          {label}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-300">
                        {count} {count === 1 ? 'instance' : 'instances'}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color.stroke,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confidence Score Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Confidence Distribution
              </h2>
              <p className="text-xs text-slate-400">
                Score bracket breakdown
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {Object.entries(summary.confidenceBuckets).map(([bucket, count]) => {
              const pct = totalBucketsCount > 0 ? (count / totalBucketsCount) * 100 : 0;

              return (
                <div key={bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {bucket}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Engine Usage Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg">
        <h2 className="text-sm font-bold text-white mb-1">
          Model Engine Deployments
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Session allocation across Gemini 3.7 Flash Cloud AI vs COCO-SSD Edge ML
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300">
                Gemini 3.7 Flash Vision
              </span>
              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white font-mono">
                Cloud AI
              </span>
            </div>
            <div className="mt-2 text-xl font-bold text-white">
              {summary.modelUsage['Gemini 3.7 Flash'] || 0} Runs
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              High precision open-vocabulary multimodal scans.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-600/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                COCO-SSD MobileNet
              </span>
              <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white font-mono">
                Edge WebML
              </span>
            </div>
            <div className="mt-2 text-xl font-bold text-white">
              {summary.modelUsage['COCO-SSD MobileNet v2'] || 0} Runs
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Instant on-device zero-latency local scans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
