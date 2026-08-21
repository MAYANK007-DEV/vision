import { DetectionResult, AnalyticsSummary } from '../types';

const STORAGE_KEY = 'visiondetect_history_v1';
const SETTINGS_KEY = 'visiondetect_settings_v1';

export function getHistory(): DetectionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export const getDetectionHistory = getHistory;

export function saveDetectionToHistory(result: DetectionResult): void {
  try {
    const current = getHistory();
    // Prepend new item and keep up to 30 items
    const updated = [result, ...current.filter((item) => item.id !== result.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Storage quota exceeded or error saving history', e);
    // If quota exceeded, trim image URLs and keep lighter objects
    try {
      const current = getHistory();
      const lightweight = [
        { ...result, imageUrl: '', thumbnailUrl: '' },
        ...current.slice(0, 15).map((i) => ({ ...i, imageUrl: '', thumbnailUrl: '' })),
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // ignore
    }
  }
}

export function deleteHistoryItem(id: string): DetectionResult[] {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function computeAnalyticsSummary(history: DetectionResult[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    totalScans: history.length,
    totalObjectsDetected: 0,
    averageConfidence: 0,
    topClass: null,
    classDistribution: {},
    confidenceBuckets: {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '50-69%': 0,
      '<50%': 0,
    },
    modelUsage: {},
    recentTimeline: [],
  };

  if (history.length === 0) return summary;

  let totalConfidenceSum = 0;
  let totalObjects = 0;

  for (const session of history) {
    // Model usage
    const m = session.modelUsed || 'Gemini 3.7 Flash';
    summary.modelUsage[m] = (summary.modelUsage[m] || 0) + 1;

    for (const obj of session.objects) {
      totalObjects++;
      totalConfidenceSum += obj.confidence;

      // Class frequency
      const lbl = obj.label.toLowerCase();
      summary.classDistribution[lbl] = (summary.classDistribution[lbl] || 0) + 1;

      // Confidence buckets
      const pct = obj.confidence * 100;
      if (pct >= 90) summary.confidenceBuckets['90-100%']++;
      else if (pct >= 80) summary.confidenceBuckets['80-89%']++;
      else if (pct >= 70) summary.confidenceBuckets['70-79%']++;
      else if (pct >= 50) summary.confidenceBuckets['50-69%']++;
      else summary.confidenceBuckets['<50%']++;
    }
  }

  summary.totalObjectsDetected = totalObjects;
  summary.averageConfidence = totalObjects > 0 ? totalConfidenceSum / totalObjects : 0;

  // Determine top class
  let highestCount = 0;
  let topLbl = '';
  for (const [lbl, count] of Object.entries(summary.classDistribution)) {
    if (count > highestCount) {
      highestCount = count;
      topLbl = lbl;
    }
  }

  if (topLbl) {
    summary.topClass = { label: topLbl, count: highestCount };
  }

  // Recent timeline (last 7 days / sessions)
  const timelineMap: Record<string, number> = {};
  for (const s of history.slice(0, 15)) {
    const d = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    timelineMap[d] = (timelineMap[d] || 0) + s.objects.length;
  }
  summary.recentTimeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count }));

  return summary;
}
