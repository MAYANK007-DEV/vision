export interface BoundingBox {
  x: number; // 0 to 1 (left)
  y: number; // 0 to 1 (top)
  width: number; // 0 to 1 (width)
  height: number; // 0 to 1 (height)
  raw?: number[]; // [ymin, xmin, ymax, xmax] or [x, y, w, h]
}

export interface DetectedObject {
  id: string;
  label: string;
  category: string;
  confidence: number; // 0 to 1
  attributes?: string;
  bbox: BoundingBox;
  color?: string; // Precalculated display color for consistency
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  thumbnailUrl?: string;
  imageName?: string;
  modelUsed: string;
  modelType: string;
  inferenceTimeMs: number;
  sceneDescription?: string;
  objects: DetectedObject[];
  rawCount: number;
  imageDimensions: {
    width: number;
    height: number;
  };
}

export type DetectionModelId = 'gemini-3.7-flash' | 'coco-ssd-edge';

export interface ModelSpec {
  id: DetectionModelId;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  architecture: string;
  latencyEstimate: string;
  supportedClassesCount: string;
  executionEnvironment: 'Cloud AI' | 'Edge / Browser WebGL';
  bestFor: string;
  privacy: string;
  inputResolution: string;
}

export interface DetectionSettings {
  confidenceThreshold: number; // 0.0 to 1.0 (default 0.50)
  defaultModel: DetectionModelId;
  showLabels: boolean;
  showConfidence: boolean;
  showBoundingBoxes: boolean;
  showFillGlow: boolean;
  boxCornerStyle: 'tech' | 'rounded' | 'classic';
  cameraFpsLimit: number; // 15, 30, 60
  cameraIntervalMs: number; // For live detection loop
  theme: 'dark' | 'light' | 'system';
  maxHistoryItems: number;
}

export interface AnalyticsSummary {
  totalScans: number;
  totalObjectsDetected: number;
  averageConfidence: number;
  topClass: { label: string; count: number } | null;
  classDistribution: Record<string, number>;
  confidenceBuckets: {
    '90-100%': number;
    '80-89%': number;
    '70-79%': number;
    '50-69%': number;
    '<50%': number;
  };
  modelUsage: Record<string, number>;
  recentTimeline: { date: string; count: number }[];
}

export type ActiveTab = 'landing' | 'overview' | 'image' | 'camera' | 'history' | 'analytics' | 'settings';
export type TabType = ActiveTab;
