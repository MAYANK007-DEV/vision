import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser for JSON payloads (allowing base64 images up to 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real AI Object Detection endpoint powered by Gemini 3.7 Flash
app.post('/api/detect', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', confidenceThreshold = 0.3 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body.' });
    }

    // Clean base64 string if it contains prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/, '');

    const ai = getGeminiClient();

    const systemPrompt = `You are a state-of-the-art Computer Vision Object Detection engine.
Analyze the provided image and detect all prominent and distinct objects.
For each detected object:
1. Provide a concise label / class name (e.g., 'person', 'car', 'laptop', 'chair', 'coffee mug', 'dog', 'bicycle', 'cell phone', etc.).
2. Provide a standardized primary category (e.g., 'Person', 'Vehicle', 'Animal', 'Electronics', 'Furniture', 'Food & Drink', 'Clothing', 'Outdoor', 'Indoor Object').
3. Provide an estimated confidence score between 0.00 and 1.00.
4. Provide the exact normalized bounding box coordinates where:
   - ymin: top coordinate (0 to 1000, integer)
   - xmin: left coordinate (0 to 1000, integer)
   - ymax: bottom coordinate (0 to 1000, integer)
   - xmax: right coordinate (0 to 1000, integer)
   Ensure ymin < ymax and xmin < xmax.
5. Provide a brief 3-6 word visual attribute description (e.g., "blue sedan parked on street", "person wearing gray sweater").

Only detect genuine visible objects. Provide accurate bounding boxes tightly framing each object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: 'Detect all objects in this image and return precise bounding box coordinates [ymin, xmin, ymax, xmax] normalized on a 0-1000 scale, with labels, categories, and confidence.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneDescription: {
              type: Type.STRING,
              description: 'A brief 1-2 sentence overview of the scene context and lighting.',
            },
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: {
                    type: Type.STRING,
                    description: 'Name of the detected object class',
                  },
                  category: {
                    type: Type.STRING,
                    description: 'Broad category of the object',
                  },
                  confidence: {
                    type: Type.NUMBER,
                    description: 'Confidence score from 0.00 to 1.00',
                  },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '[ymin, xmin, ymax, xmax] in 0-1000 range',
                  },
                  attributes: {
                    type: Type.STRING,
                    description: 'Short visual description',
                  },
                },
                required: ['label', 'confidence', 'box_2d'],
              },
            },
          },
          required: ['objects'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from vision model');
    }

    const parsedData = JSON.parse(text);
    
    // Normalize bounding box format to standard [x, y, width, height] percentage (0..1)
    const objects = (parsedData.objects || []).map((obj: any, index: number) => {
      const [ymin, xmin, ymax, xmax] = obj.box_2d || [0, 0, 1000, 1000];
      
      const normXmin = Math.max(0, Math.min(1000, xmin)) / 1000;
      const normYmin = Math.max(0, Math.min(1000, ymin)) / 1000;
      const normXmax = Math.max(0, Math.min(1000, xmax)) / 1000;
      const normYmax = Math.max(0, Math.min(1000, ymax)) / 1000;

      const normWidth = Math.max(0.01, normXmax - normXmin);
      const normHeight = Math.max(0.01, normYmax - normYmin);

      return {
        id: `det-${Date.now()}-${index}`,
        label: String(obj.label || 'Object').toLowerCase(),
        category: obj.category || 'Object',
        confidence: Number(obj.confidence) || 0.85,
        attributes: obj.attributes || '',
        // Normalized 0..1 bounding box coordinates
        bbox: {
          x: normXmin,
          y: normYmin,
          width: normWidth,
          height: normHeight,
          // Raw coordinates
          raw: [ymin, xmin, ymax, xmax],
        },
      };
    });

    // Filter by threshold
    const filteredObjects = objects.filter((o: any) => o.confidence >= confidenceThreshold);

    res.json({
      success: true,
      model: 'gemini-3.7-flash',
      modelType: 'Cloud Multimodal Neural Vision',
      sceneDescription: parsedData.sceneDescription || 'Scene analyzed successfully.',
      totalDetected: filteredObjects.length,
      rawDetected: objects.length,
      objects: filteredObjects,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Detection API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Object detection inference failed',
    });
  }
});

// Start Vite / Express server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VisionDetect AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
