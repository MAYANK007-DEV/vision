import { DetectedObject, DetectionResult } from '../types';
import { getObjectColor } from '../data/cocoClasses';

export interface RenderExportOptions {
  showLabels?: boolean;
  showConfidence?: boolean;
  showBoundingBoxes?: boolean;
  showFillGlow?: boolean;
  boxCornerStyle?: 'tech' | 'rounded' | 'classic';
  threshold?: number;
}

export async function downloadAnnotatedImage(
  imageSource: string | HTMLImageElement,
  objects: DetectedObject[],
  options: RenderExportOptions = {},
  filenamePrefix = 'visiondetect-annotated'
): Promise<void> {
  const {
    showLabels = true,
    showConfidence = true,
    showBoundingBoxes = true,
    showFillGlow = true,
    threshold = 0,
  } = options;

  const filteredObjects = objects.filter((o) => o.confidence >= threshold);

  // Load image if string
  let imgElement: HTMLImageElement;
  if (typeof imageSource === 'string') {
    imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = imageSource;
    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = () => reject(new Error('Failed to load image for export.'));
    });
  } else {
    imgElement = imageSource;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  const width = imgElement.naturalWidth || imgElement.width || 800;
  const height = imgElement.naturalHeight || imgElement.height || 600;

  canvas.width = width;
  canvas.height = height;

  // 1. Draw base image
  ctx.drawImage(imgElement, 0, 0, width, height);

  // 2. Draw annotations
  if (showBoundingBoxes && filteredObjects.length > 0) {
    // Scale font & stroke relative to resolution
    const baseScale = Math.max(1, Math.min(width, height) / 800);
    const strokeWidth = Math.max(2, Math.round(3 * baseScale));
    const fontSize = Math.max(12, Math.round(14 * baseScale));

    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';

    for (const obj of filteredObjects) {
      const color = getObjectColor(obj.label, obj.category);
      const bx = obj.bbox.x * width;
      const by = obj.bbox.y * height;
      const bw = obj.bbox.width * width;
      const bh = obj.bbox.height * height;

      // Fill glow if enabled
      if (showFillGlow) {
        ctx.fillStyle = color.fill;
        ctx.fillRect(bx, by, bw, bh);
      }

      // Box stroke
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(bx, by, bw, bh);

      // Tech reticle corners
      const cornerLen = Math.min(16 * baseScale, Math.min(bw, bh) / 4);
      ctx.lineWidth = strokeWidth + 1.5;
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      // Top-Right
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      // Bottom-Left
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      // Bottom-Right
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // Label Pill
      if (showLabels || showConfidence) {
        let text = '';
        if (showLabels && showConfidence) {
          text = `${obj.label.toUpperCase()} ${Math.round(obj.confidence * 100)}%`;
        } else if (showLabels) {
          text = obj.label.toUpperCase();
        } else {
          text = `${Math.round(obj.confidence * 100)}%`;
        }

        const paddingX = 8 * baseScale;
        const paddingY = 4 * baseScale;
        const textMetrics = ctx.measureText(text);
        const tagWidth = textMetrics.width + paddingX * 2;
        const tagHeight = fontSize + paddingY * 2;

        let tagY = by - tagHeight - 2;
        if (tagY < 0) {
          tagY = by + 2; // Flip inside if near top
        }

        // Draw tag background
        ctx.fillStyle = color.stroke;
        ctx.fillRect(bx, tagY, tagWidth, tagHeight);

        // Draw tag text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, bx + paddingX, tagY + tagHeight / 2);
      }
    }

    // VisionDetect watermark stamp at bottom right
    const stampText = 'VisionDetect AI';
    const stampFontSize = Math.max(10, Math.round(12 * baseScale));
    ctx.font = `500 ${stampFontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    const stampMetrics = ctx.measureText(stampText);
    ctx.fillRect(width - stampMetrics.width - 24, height - stampFontSize - 16, stampMetrics.width + 16, stampFontSize + 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(stampText, width - stampMetrics.width - 16, height - stampFontSize / 2 - 11);
  }

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filenamePrefix}-${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDetectionJSON(result: DetectionResult): void {
  const exportPayload = {
    app: 'VisionDetect AI',
    version: '2.0.0',
    exportTimestamp: new Date().toISOString(),
    detectionId: result.id,
    sessionTimestamp: result.timestamp,
    imageName: result.imageName || 'unnamed-image',
    dimensions: result.imageDimensions,
    modelUsed: result.modelUsed,
    modelType: result.modelType,
    inferenceTimeMs: result.inferenceTimeMs,
    sceneDescription: result.sceneDescription || '',
    totalObjects: result.objects.length,
    objects: result.objects.map((obj) => ({
      id: obj.id,
      label: obj.label,
      category: obj.category,
      confidence: obj.confidence,
      confidencePercentage: `${Math.round(obj.confidence * 100)}%`,
      attributes: obj.attributes || '',
      boundingBox: {
        normalized: {
          x: obj.bbox.x,
          y: obj.bbox.y,
          width: obj.bbox.width,
          height: obj.bbox.height,
        },
        pixels: {
          x: Math.round(obj.bbox.x * result.imageDimensions.width),
          y: Math.round(obj.bbox.y * result.imageDimensions.height),
          width: Math.round(obj.bbox.width * result.imageDimensions.width),
          height: Math.round(obj.bbox.height * result.imageDimensions.height),
        },
      },
    })),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download = `visiondetect-data-${result.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDetectionCSV(result: DetectionResult): void {
  const headers = [
    'Object_Index',
    'Label',
    'Category',
    'Confidence_Score',
    'Confidence_Percent',
    'Attributes',
    'Norm_X',
    'Norm_Y',
    'Norm_Width',
    'Norm_Height',
    'Pixel_X',
    'Pixel_Y',
    'Pixel_Width',
    'Pixel_Height',
    'Model',
    'Timestamp',
  ];

  const rows = result.objects.map((obj, idx) => {
    const pxX = Math.round(obj.bbox.x * result.imageDimensions.width);
    const pxY = Math.round(obj.bbox.y * result.imageDimensions.height);
    const pxW = Math.round(obj.bbox.width * result.imageDimensions.width);
    const pxH = Math.round(obj.bbox.height * result.imageDimensions.height);

    return [
      idx + 1,
      `"${obj.label.replace(/"/g, '""')}"`,
      `"${obj.category.replace(/"/g, '""')}"`,
      obj.confidence.toFixed(4),
      `${Math.round(obj.confidence * 100)}%`,
      `"${(obj.attributes || '').replace(/"/g, '""')}"`,
      obj.bbox.x.toFixed(4),
      obj.bbox.y.toFixed(4),
      obj.bbox.width.toFixed(4),
      obj.bbox.height.toFixed(4),
      pxX,
      pxY,
      pxW,
      pxH,
      `"${result.modelUsed}"`,
      `"${result.timestamp}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `visiondetect-records-${result.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
