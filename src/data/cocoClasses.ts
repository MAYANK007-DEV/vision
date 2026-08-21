export interface ObjectClassDef {
  name: string;
  category: 'Person' | 'Vehicle' | 'Animal' | 'Accessory' | 'Sports' | 'Kitchen' | 'Food' | 'Furniture' | 'Electronics' | 'Appliance' | 'Indoor';
  description: string;
}

export const COCO_CLASSES: ObjectClassDef[] = [
  // People
  { name: 'person', category: 'Person', description: 'Humans, pedestrians, athletes, workers' },
  
  // Vehicles
  { name: 'bicycle', category: 'Vehicle', description: 'Two-wheeled pedal or electric bicycles' },
  { name: 'car', category: 'Vehicle', description: 'Passenger cars, sedans, SUVs, hatchbacks' },
  { name: 'motorcycle', category: 'Vehicle', description: 'Motorbikes, scooters, mopeds' },
  { name: 'airplane', category: 'Vehicle', description: 'Commercial aircraft, private planes, jets' },
  { name: 'bus', category: 'Vehicle', description: 'City transit buses, coach buses, school buses' },
  { name: 'train', category: 'Vehicle', description: 'Locomotives, passenger trains, freight cars' },
  { name: 'truck', category: 'Vehicle', description: 'Pickup trucks, heavy freight semi-trailers' },
  { name: 'boat', category: 'Vehicle', description: 'Motorboats, sailboats, yachts, ships' },
  
  // Outdoor / Traffic
  { name: 'traffic light', category: 'Indoor', description: 'Street traffic signal lights' },
  { name: 'fire hydrant', category: 'Indoor', description: 'Municipal water hydrants' },
  { name: 'stop sign', category: 'Indoor', description: 'Octagonal traffic stop indicators' },
  { name: 'parking meter', category: 'Indoor', description: 'Street side parking meters' },
  { name: 'bench', category: 'Furniture', description: 'Park benches, public seating' },
  
  // Animals
  { name: 'bird', category: 'Animal', description: 'Wild and domestic avian species' },
  { name: 'cat', category: 'Animal', description: 'Domestic felines and kittens' },
  { name: 'dog', category: 'Animal', description: 'Canines, domestic dogs, puppies' },
  { name: 'horse', category: 'Animal', description: 'Equine breeds, horses, stallions' },
  { name: 'sheep', category: 'Animal', description: 'Sheep, lambs, livestock' },
  { name: 'cow', category: 'Animal', description: 'Cattle, cows, calves' },
  { name: 'elephant', category: 'Animal', description: 'African and Asian elephants' },
  { name: 'bear', category: 'Animal', description: 'Grizzly, black, polar bears' },
  { name: 'zebra', category: 'Animal', description: 'Wild striped zebras' },
  { name: 'giraffe', category: 'Animal', description: 'Tall wild giraffes' },
  
  // Accessories
  { name: 'backpack', category: 'Accessory', description: 'Travel backpacks, school bookbags' },
  { name: 'umbrella', category: 'Accessory', description: 'Rain umbrellas, parasols' },
  { name: 'handbag', category: 'Accessory', description: 'Purses, shoulder bags, totes' },
  { name: 'tie', category: 'Accessory', description: 'Neckties, bowties' },
  { name: 'suitcase', category: 'Accessory', description: 'Luggage cases, rolling bags' },
  
  // Sports
  { name: 'frisbee', category: 'Sports', description: 'Flying discs' },
  { name: 'skis', category: 'Sports', description: 'Snow skis and poles' },
  { name: 'snowboard', category: 'Sports', description: 'Winter snowboards' },
  { name: 'sports ball', category: 'Sports', description: 'Basketballs, footballs, soccer balls, tennis balls' },
  { name: 'kite', category: 'Sports', description: 'Wind flying kites' },
  { name: 'baseball bat', category: 'Sports', description: 'Wooden and aluminum bats' },
  { name: 'baseball glove', category: 'Sports', description: 'Leather mitts' },
  { name: 'skateboard', category: 'Sports', description: 'Street skateboards, longboards' },
  { name: 'surfboard', category: 'Sports', description: 'Ocean surfboards' },
  { name: 'tennis racket', category: 'Sports', description: 'String tennis rackets' },
  
  // Kitchen & Food
  { name: 'bottle', category: 'Kitchen', description: 'Water bottles, glass beverage bottles' },
  { name: 'wine glass', category: 'Kitchen', description: 'Stemmed wine glassware' },
  { name: 'cup', category: 'Kitchen', description: 'Mugs, coffee cups, tea cups' },
  { name: 'fork', category: 'Kitchen', description: 'Dining forks' },
  { name: 'knife', category: 'Kitchen', description: 'Kitchen knives, dining cutlery' },
  { name: 'spoon', category: 'Kitchen', description: 'Soup and dessert spoons' },
  { name: 'bowl', category: 'Kitchen', description: 'Ceramic, glass, metal bowls' },
  { name: 'banana', category: 'Food', description: 'Fresh ripe bananas' },
  { name: 'apple', category: 'Food', description: 'Red and green apples' },
  { name: 'sandwich', category: 'Food', description: 'Subs, sandwiches, paninis' },
  { name: 'orange', category: 'Food', description: 'Citrus oranges, mandarins' },
  { name: 'broccoli', category: 'Food', description: 'Fresh vegetable heads' },
  { name: 'carrot', category: 'Food', description: 'Root carrots' },
  { name: 'hot dog', category: 'Food', description: 'Frankfurters and buns' },
  { name: 'pizza', category: 'Food', description: 'Pizza slices and whole pies' },
  { name: 'donut', category: 'Food', description: 'Glazed pastries' },
  { name: 'cake', category: 'Food', description: 'Baked celebration cakes' },
  
  // Furniture
  { name: 'chair', category: 'Furniture', description: 'Office chairs, dining chairs, armchairs' },
  { name: 'couch', category: 'Furniture', description: 'Sofas, sectionals, living room couches' },
  { name: 'potted plant', category: 'Indoor', description: 'Houseplants, flowers in pots' },
  { name: 'bed', category: 'Furniture', description: 'Mattresses, bed frames' },
  { name: 'dining table', category: 'Furniture', description: 'Kitchen tables, conference desks' },
  { name: 'toilet', category: 'Furniture', description: 'Bathroom plumbing fixtures' },
  
  // Electronics
  { name: 'tv', category: 'Electronics', description: 'Television screens, monitors' },
  { name: 'laptop', category: 'Electronics', description: 'Notebook computers, MacBooks' },
  { name: 'mouse', category: 'Electronics', description: 'Computer pointing devices' },
  { name: 'remote', category: 'Electronics', description: 'Television remote controls' },
  { name: 'keyboard', category: 'Electronics', description: 'Computer QWERTY keyboards' },
  { name: 'cell phone', category: 'Electronics', description: 'Smartphones, iPhones, mobile phones' },
  
  // Appliances
  { name: 'microwave', category: 'Appliance', description: 'Countertop microwave ovens' },
  { name: 'oven', category: 'Appliance', description: 'Baking ovens, kitchen stoves' },
  { name: 'toaster', category: 'Appliance', description: 'Bread toasters' },
  { name: 'sink', category: 'Appliance', description: 'Kitchen and bathroom wash basins' },
  { name: 'refrigerator', category: 'Appliance', description: 'Cooling fridges, freezers' },
  
  // Indoor Objects
  { name: 'book', category: 'Indoor', description: 'Paperback, hardcover books' },
  { name: 'clock', category: 'Indoor', description: 'Wall clocks, desk timepieces' },
  { name: 'vase', category: 'Indoor', description: 'Decorative flower vases' },
  { name: 'scissors', category: 'Indoor', description: 'Cutting scissors' },
  { name: 'teddy bear', category: 'Indoor', description: 'Stuffed plush toys' },
  { name: 'hair drier', category: 'Indoor', description: 'Blow driers' },
  { name: 'toothbrush', category: 'Indoor', description: 'Oral hygiene brushes' },
];

export const CATEGORY_COLORS: Record<string, { stroke: string; fill: string; text: string; bgBadge: string }> = {
  Person: {
    stroke: '#3b82f6', // blue-500
    fill: 'rgba(59, 130, 246, 0.15)',
    text: '#2563eb',
    bgBadge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  Vehicle: {
    stroke: '#f59e0b', // amber-500
    fill: 'rgba(245, 158, 11, 0.15)',
    text: '#d97706',
    bgBadge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  Animal: {
    stroke: '#10b981', // emerald-500
    fill: 'rgba(16, 185, 129, 0.15)',
    text: '#059669',
    bgBadge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  Electronics: {
    stroke: '#06b6d4', // cyan-500
    fill: 'rgba(6, 182, 212, 0.15)',
    text: '#0891b2',
    bgBadge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  },
  Furniture: {
    stroke: '#ec4899', // pink-500
    fill: 'rgba(236, 72, 153, 0.15)',
    text: '#db2777',
    bgBadge: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
  },
  Kitchen: {
    stroke: '#8b5cf6', // purple-500
    fill: 'rgba(139, 92, 246, 0.15)',
    text: '#7c3aed',
    bgBadge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  Food: {
    stroke: '#f97316', // orange-500
    fill: 'rgba(249, 115, 22, 0.15)',
    text: '#ea580c',
    bgBadge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  },
  Accessory: {
    stroke: '#14b8a6', // teal-500
    fill: 'rgba(20, 184, 166, 0.15)',
    text: '#0d9488',
    bgBadge: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
  },
  Sports: {
    stroke: '#e11d48', // rose-600
    fill: 'rgba(225, 29, 72, 0.15)',
    text: '#be123c',
    bgBadge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  Appliance: {
    stroke: '#6366f1', // indigo-500
    fill: 'rgba(99, 102, 241, 0.15)',
    text: '#4f46e5',
    bgBadge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  Indoor: {
    stroke: '#64748b', // slate-500
    fill: 'rgba(100, 116, 139, 0.15)',
    text: '#475569',
    bgBadge: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
};

export function getObjectColor(label: string, category?: string) {
  if (category && CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Lookup COCO category
  const match = COCO_CLASSES.find((c) => c.name.toLowerCase() === label.toLowerCase());
  if (match && CATEGORY_COLORS[match.category]) {
    return CATEGORY_COLORS[match.category];
  }

  // Fallback hash color for open-vocabulary detection
  const defaultKeys = Object.keys(CATEGORY_COLORS);
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % defaultKeys.length;
  return CATEGORY_COLORS[defaultKeys[index]];
}
