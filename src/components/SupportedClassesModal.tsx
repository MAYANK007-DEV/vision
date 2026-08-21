import React, { useState } from 'react';
import { X, Search, Layers, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { COCO_CLASSES, CATEGORY_COLORS } from '../data/cocoClasses';

interface SupportedClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportedClassesModal: React.FC<SupportedClassesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Person', 'Vehicle', 'Animal', 'Electronics', 'Furniture', 'Kitchen', 'Food', 'Sports', 'Indoor'];

  const filtered = COCO_CLASSES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-[#111827] shadow-2xl border border-slate-800 text-slate-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-bold text-white sm:text-lg">
                Supported Object Classes Directory
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              80 Standard MS COCO classes (COCO-SSD Edge) & Open-Vocabulary objects (Gemini AI).
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="border-b border-slate-800 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search classes (e.g., person, bicycle, laptop, dog)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Indoor;
              return (
                <div
                  key={item.name}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold capitalize text-white text-xs">
                        {item.name}
                      </span>
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[9px] font-bold font-mono"
                        style={{ backgroundColor: color.fill, color: color.stroke }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No classes matched your search. Note that Gemini 3.7 Flash supports arbitrary open-vocabulary objects beyond standard COCO.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 text-xs">
          <span className="text-slate-400 font-medium font-mono">
            Showing {filtered.length} of {COCO_CLASSES.length} baseline classes
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
