export interface Note {
  id: string;
  title: string;
  content: string;
  tags: [string, number][];
  createdAt: string;
  updatedAt: string;
  type: 'workout' | 'nutrition' | 'general';
  metadata?: Record<string, any>;
}

export interface WorkoutNote extends Note {
  type: 'workout';
  metadata: {
    exercises: Exercise[];
    duration: number;
    caloriesBurned?: number;
    heartRate?: {
      avg: number;
      max: number;
    };
  };
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number[];
  weight?: number[];
  restTime?: number;
  notes?: string;
}

export interface NutritionNote extends Note {
  type: 'nutrition';
  metadata: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    foods: FoodItem[];
  };
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface MCPResource {
  name: string;
  uri: string;
  mimeType?: string;
  description?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPRequest {
  method: string;
  params: Record<string, any>;
}

export interface MCPResponse {
  content?: any[];
  isError?: boolean;
}