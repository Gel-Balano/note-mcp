interface WorkoutAnalysisInput {
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

export async function analyzeWorkout(input: WorkoutAnalysisInput): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  const { workoutData } = input;
  
  const totalSets = workoutData.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const totalReps = workoutData.exercises.reduce((sum, exercise) =>
    sum + exercise.reps.reduce((repSum, reps) => repSum + reps, 0), 0
  );
  
  const totalWeight = workoutData.exercises.reduce((sum, exercise) => {
    if (exercise.weight) {
      return sum + exercise.weight.reduce((weightSum, weight) => weightSum + weight, 0);
    }
    return sum;
  }, 0);

  const avgRepsPerSet = totalReps / totalSets;
  const exerciseCount = workoutData.exercises.length;
  
  const intensity = workoutData.duration > 0 ? totalWeight / workoutData.duration : 0;
  
  const insights = [
    `Completed ${exerciseCount} exercises with ${totalSets} total sets`,
    `Total reps: ${totalReps} (avg ${avgRepsPerSet.toFixed(1)} reps/set)`,
    workoutData.caloriesBurned ? `Calories burned: ${workoutData.caloriesBurned}` : '',
    `Workout duration: ${workoutData.duration} minutes`,
    `Intensity score: ${intensity.toFixed(2)} kg/min`,
  ].filter(Boolean);

  const recommendations: string[] = [];
  
  if (avgRepsPerSet < 8) {
    recommendations.push('Consider increasing reps per set for better muscle engagement');
  }
  
  if (workoutData.duration < 30) {
    recommendations.push('Consider extending workout duration for better results');
  }
  
  if (workoutData.exercises.length < 3) {
    recommendations.push('Add more exercises to target different muscle groups');
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          summary: {
            exercises: exerciseCount,
            totalSets,
            totalReps,
            totalWeight,
            duration: workoutData.duration,
            caloriesBurned: workoutData.caloriesBurned || 0,
          },
          insights,
          recommendations,
          nextWorkout: {
            suggestedExercises: workoutData.exercises.slice(0, 3).map(e => e.name),
            targetDuration: Math.min(workoutData.duration + 10, 90),
          }
        }, null, 2)
      }
    ]
  };
}

// Define the calculateWorkoutHours tool structure
export const calculateWorkoutHours = {
  name: 'calculate-workout-hours',
  description: 'Calculate total workout hours from exercise notes',
  parameters: {
    type: 'object',
    properties: {
      workoutData: {
        type: 'object',
        description: 'Workout data containing exercises and metadata',
        properties: {
          exercises: {
            type: 'array',
            description: 'List of exercises performed',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the exercise'
                },
                sets: {
                  type: 'number',
                  description: 'Number of sets performed'
                },
                reps: {
                  type: 'array',
                  description: 'Array of reps for each set',
                  items: {
                    type: 'number'
                  }
                },
                weight: {
                  type: 'array',
                  description: 'Array of weights used for each set (optional)',
                  items: {
                    type: 'number'
                  }
                },
                restTime: {
                  type: 'number',
                  description: 'Rest time between sets in seconds (optional)'
                },
                notes: {
                  type: 'string',
                  description: 'Additional notes about the exercise (optional)'
                }
              },
              required: ['name', 'sets', 'reps']
            }
          },
          duration: {
            type: 'number',
            description: 'Total workout duration in minutes'
          },
          date: {
            type: 'string',
            description: 'Date of the workout in ISO format'
          },
          caloriesBurned: {
            type: 'number',
            description: 'Calories burned during workout (optional)'
          },
          heartRate: {
            type: 'object',
            description: 'Heart rate data (optional)',
            properties: {
              avg: {
                type: 'number',
                description: 'Average heart rate'
              },
              max: {
                type: 'number',
                description: 'Maximum heart rate'
              }
            },
            required: ['avg', 'max']
          }
        },
        required: ['exercises', 'duration', 'date']
      }
    },
    required: ['workoutData']
  },
  handler: analyzeWorkout
};

export default calculateWorkoutHours;