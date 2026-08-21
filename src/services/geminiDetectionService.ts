import { DetectedObject } from '../types';
import { getObjectColor } from '../data/cocoClasses';

export interface GeminiDetectionResponse {
  success: boolean;
  model: string;
  modelType: string;
  sceneDescription: string;
  totalDetected: number;
  rawDetected: number;
  objects: DetectedObject[];
  timestamp: string;
  error?: string;
}

export async function detectWithGemini(
  imageBase64: string,
  mimeType = 'image/jpeg',
  confidenceThreshold = 0.3
): Promise<GeminiDetectionResponse> {
  const response = await fetch('/api/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      confidenceThreshold,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
    throw new Error(errorJson.error || `Server returned error status ${response.status}`);
  }

  const data: GeminiDetectionResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Gemini detection failed');
  }

  // Enrich objects with colors
  data.objects = data.objects.map((obj) => {
    const colorInfo = getObjectColor(obj.label, obj.category);
    return {
      ...obj,
      color: colorInfo.stroke,
    };
  });

  return data;
}
