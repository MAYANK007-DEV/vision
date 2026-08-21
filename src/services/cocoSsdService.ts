import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { DetectedObject } from '../types';
import { getObjectColor } from '../data/cocoClasses';

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;
let isModelReady = false;

export async function getOrLoadCocoModel(): Promise<cocoSsd.ObjectDetection> {
  if (!modelPromise) {
    modelPromise = cocoSsd.load({ base: 'mobilenet_v2' }).then((m) => {
      isModelReady = true;
      return m;
    });
  }
  return modelPromise;
}

export function isCocoModelLoaded(): boolean {
  return isModelReady;
}

export async function detectWithCocoSsd(
  imageOrVideo: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  confidenceThreshold = 0.3
): Promise<DetectedObject[]> {
  const model = await getOrLoadCocoModel();

  // Run real neural inference
  const predictions = await model.detect(imageOrVideo);

  // Determine media natural/rendered dimensions to calculate normalized 0..1 bounding boxes
  let mediaWidth = 1;
  let mediaHeight = 1;

  if (imageOrVideo instanceof HTMLImageElement) {
    mediaWidth = imageOrVideo.naturalWidth || imageOrVideo.width || 1;
    mediaHeight = imageOrVideo.naturalHeight || imageOrVideo.height || 1;
  } else if (imageOrVideo instanceof HTMLVideoElement) {
    mediaWidth = imageOrVideo.videoWidth || imageOrVideo.width || 1;
    mediaHeight = imageOrVideo.videoHeight || imageOrVideo.height || 1;
  } else if (imageOrVideo instanceof HTMLCanvasElement) {
    mediaWidth = imageOrVideo.width || 1;
    mediaHeight = imageOrVideo.height || 1;
  }

  const detectedObjects: DetectedObject[] = [];

  for (let i = 0; i < predictions.length; i++) {
    const pred = predictions[i];
    const score = pred.score;

    if (score < confidenceThreshold) continue;

    // bbox format in coco-ssd is [x, y, width, height] in pixel coordinates
    const [px, py, pWidth, pHeight] = pred.bbox;

    // Normalize to 0..1 scale
    const normX = Math.max(0, Math.min(1, px / mediaWidth));
    const normY = Math.max(0, Math.min(1, py / mediaHeight));
    const normW = Math.max(0.01, Math.min(1 - normX, pWidth / mediaWidth));
    const normH = Math.max(0.01, Math.min(1 - normY, pHeight / mediaHeight));

    const label = pred.class.toLowerCase();
    const colorInfo = getObjectColor(label);

    detectedObjects.push({
      id: `coco-${Date.now()}-${i}`,
      label,
      category: 'Object', // COCO category mapped dynamically in UI
      confidence: Number(score.toFixed(3)),
      bbox: {
        x: normX,
        y: normY,
        width: normW,
        height: normH,
        raw: [py, px, py + pHeight, px + pWidth],
      },
      color: colorInfo.stroke,
    });
  }

  return detectedObjects;
}
