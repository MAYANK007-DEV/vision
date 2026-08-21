export interface DemoSample {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  expectedObjects: string[];
}

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'demo-street-traffic',
    title: 'Urban Street Traffic',
    category: 'Transportation & Urban',
    description: 'Busy metropolitan intersection with cars, pedestrians, traffic lights, and buses.',
    imageUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['car', 'person', 'bus', 'traffic light', 'bicycle'],
  },
  {
    id: 'demo-workspace',
    title: 'Modern Workspace Desk',
    category: 'Indoor & Tech',
    description: 'Designer office desk with laptop, coffee cup, keyboard, mouse, smartphone, and chair.',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['laptop', 'cup', 'keyboard', 'mouse', 'cell phone', 'chair'],
  },
  {
    id: 'demo-living-room',
    title: 'Living Room & Dog',
    category: 'Home & Animals',
    description: 'Warm domestic interior with a couch, potted plant, coffee table, and a golden retriever dog.',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['dog', 'couch', 'potted plant', 'dining table', 'book'],
  },
  {
    id: 'demo-kitchen-dining',
    title: 'Kitchen & Gourmet Table',
    category: 'Food & Culinary',
    description: 'Dining table with fresh fruits, wine bottle, bowls, plates, and cutlery.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['bottle', 'wine glass', 'bowl', 'apple', 'banana', 'dining table'],
  },
  {
    id: 'demo-sports-cycling',
    title: 'Outdoor Cycling & Athletics',
    category: 'Sports & Active',
    description: 'Cyclist riding a sports bicycle along a scenic asphalt path with trees and backpack.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['person', 'bicycle', 'backpack', 'bench'],
  },
  {
    id: 'demo-pets-cats',
    title: 'Playful Cats & Interior',
    category: 'Animals & Interior',
    description: 'Two curious domestic cats lounging near a decorative vase and comfortable armchair.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    expectedObjects: ['cat', 'chair', 'vase', 'couch'],
  },
];
