import { calculateWorkoutHours } from './workoutAnalysis.js';

// Export the calculateWorkoutHours tool directly
export { calculateWorkoutHours };

// Also export as part of tools array for backward compatibility
export const tools = [calculateWorkoutHours];
