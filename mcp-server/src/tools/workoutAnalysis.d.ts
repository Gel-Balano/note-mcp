export interface WorkoutAnalysisInput {
  workoutData: {
    exercises: Array<{
      name: string;
      sets: number;
      reps: number[];
      weight?: number[];
      restTime?: number;
      notes?: string;
    }>;
    duration: number;
    date: string;
    caloriesBurned?: number;
    heartRate?: {
      avg: number;
      max: number;
    };
  };
}

export interface ToolParameter {
  type: string;
  properties: {
    [key: string]: {
      type: string;
      description?: string;
      default?: any;
    };
  };
  required: string[];
}

export interface ToolHandler {
  (args: any): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter;
  handler: ToolHandler;
}

export const calculateWorkoutHours: ToolDefinition;
export default calculateWorkoutHours;