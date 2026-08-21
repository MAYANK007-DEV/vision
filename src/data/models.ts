import { ModelSpec } from '../types';

export const AVAILABLE_MODELS: ModelSpec[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash Vision',
    badge: 'High Accuracy',
    tagline: 'Deep Multimodal Neural Vision & Open-Vocabulary Detection',
    description:
      'Cloud-accelerated multimodal transformer model capable of detecting both standard COCO classes and arbitrary open-vocabulary objects with detailed spatial bounding boxes, visual attributes, and scene context.',
    architecture: 'Multimodal Transformer (Vision-Language Foundation)',
    latencyEstimate: '~450ms – 900ms',
    supportedClassesCount: 'Open Vocabulary (Unlimited + 80 COCO)',
    executionEnvironment: 'Cloud AI',
    bestFor: 'High precision image analysis, complex multi-object scenes, rare object identification & visual attributes',
    privacy: 'Secure server-side API proxy (zero image persistence)',
    inputResolution: 'Up to 4K Ultra HD (Adaptive resizing)',
  },
  {
    id: 'coco-ssd-edge',
    name: 'COCO-SSD MobileNet v2',
    badge: 'Real-Time Edge',
    tagline: 'Instant Zero-Latency In-Browser Neural Network',
    description:
      'Client-side Single Shot MultiBox Detector (SSD) running via TensorFlow.js with WebGL acceleration. Provides instant inference right on your device for high-framerate Live Camera feeds.',
    architecture: 'Single Shot MultiBox Detector (MobileNet v2 Backbone)',
    latencyEstimate: '~15ms – 40ms',
    supportedClassesCount: '80 COCO Standard Classes',
    executionEnvironment: 'Edge / Browser WebGL',
    bestFor: 'Continuous live camera tracking, offline image scans, zero-bandwidth edge execution',
    privacy: '100% On-Device (Images never leave browser)',
    inputResolution: '300x300 to 640x640 (Hardware accelerated)',
  },
];
