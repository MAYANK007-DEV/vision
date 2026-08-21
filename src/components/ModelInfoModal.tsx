import React from 'react';
import { X, Cpu, Sparkles, Zap, ShieldCheck, Layers, Gauge, Check, Info } from 'lucide-react';
import { AVAILABLE_MODELS } from '../data/models';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-[#111827] shadow-2xl border border-slate-800 text-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-bold text-white sm:text-lg">
                Computer Vision Model Architectures
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Technical breakdown of Cloud Multimodal Transformer vs Edge WebGL Neural Networks.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Models Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {AVAILABLE_MODELS.map((model) => {
              const isCloud = model.executionEnvironment === 'Cloud AI';
              return (
                <div
                  key={model.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">
                        {model.name}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono ${
                          isCloud
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-400 leading-relaxed">
                      {model.description}
                    </p>

                    <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Backbone:</span>
                        <span className="font-semibold text-slate-200 text-right max-w-[180px]">
                          {model.architecture}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Typical Latency:</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {model.latencyEstimate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vocabulary:</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {model.supportedClassesCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Execution Env:</span>
                        <span className="font-semibold text-slate-200">
                          {model.executionEnvironment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Optimal Use Case
                    </span>
                    <p className="mt-0.5 font-medium text-slate-300">
                      {model.bestFor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture Comparison Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider font-mono">
              Engineering Architecture Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400">
                    <th className="pb-2">Capability</th>
                    <th className="pb-2 text-blue-400">Gemini 3.7 Flash Vision</th>
                    <th className="pb-2 text-amber-400">COCO-SSD Edge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2.5 font-medium">Fine-Grained Context</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">Yes (Full scene description + attributes)</td>
                    <td className="py-2.5 text-slate-400">Class labels only</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Open-Vocabulary</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">Yes (Detects arbitrary items)</td>
                    <td className="py-2.5 text-slate-400">Fixed 80 COCO classes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Camera Real-Time Streaming</td>
                    <td className="py-2.5 text-slate-400">High API overhead for continuous stream</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">Yes (30+ FPS on GPU/WebGL)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Zero Network Dependency</td>
                    <td className="py-2.5 text-slate-400">Requires Internet</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">100% Offline Capable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
