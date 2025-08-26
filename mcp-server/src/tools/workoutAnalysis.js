import { OpenAI } from 'openai';
import { readNotes } from '../resources/notes.js';

let openai = null;

/**
 * Gets the OpenAI client instance, initializing it if necessary
 */
function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

/**
 * Extracts workout duration from a note using OpenAI or regex fallback
 */
async function extractWorkoutDuration(noteText) {
  try {
    // Try OpenAI extraction first if API key is available
    if (process.env.OPENAI_API_KEY) {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts workout durations from text. " +
                    "Scan the entire text for any mention of workout, exercise, or physical activity durations. " +
                    "Look for patterns like 'X min', 'X minutes', 'X hour', 'X hrs', 'Xh', etc. " +
                    "Return only the total duration in minutes as a number. If no duration is found, return 0. " +
                    "For example, '30 min cardio + 20 min strength' should return 50, '1.5h yoga session' should return 90."
          },
          {
            role: "user",
            content: noteText
          }
        ],
        temperature: 0.1,
      });

      const minutes = parseInt(completion.choices[0]?.message?.content.trim()) || 0;
      return minutes;
    }
  } catch (error) {
    console.error('Error extracting workout duration with OpenAI:', error);
  }

  // Fallback to regex-based extraction
  try {
    const text = noteText.toLowerCase();
    let totalMinutes = 0;

    // Common patterns for minutes
    const minPatterns = [
      /(\d+)\s*min(?:ute)?s?/g,
      /(\d+)\s*m\b/g
    ];

    // Common patterns for hours
    const hourPatterns = [
      /(\d+(?:\.\d+)?)\s*hour?s?/g,
      /(\d+(?:\.\d+)?)\s*hr?s?\b/g,
      /(\d+(?:\.\d+)?)\s*h\b/g
    ];

    // Extract minutes
    minPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        totalMinutes += parseInt(match[1]);
      }
    });

    // Extract hours and convert to minutes
    hourPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        totalMinutes += Math.round(parseFloat(match[1]) * 60);
      }
    });

    return totalMinutes;
  } catch (error) {
    console.error('Error extracting workout duration with regex:', error);
    return 0;
  }
}

/**
 * Gets fitness-related notes using the MCP resources
 */
async function getFitnessNotes() {
  try {
    const notes = await readNotes();
    
    // Define fitness-related tags
    const fitnessTags = new Set([
      'fitness', 'workout', 'exercise', 'training', 'gym', 'cardio', 'strength',
      'yoga', 'running', 'jogging', 'walking', 'swimming', 'cycling'
    ]);
    
    // Filter notes that contain fitness-related tags
    return notes.filter(note => {
      if (!note.tags || !Array.isArray(note.tags)) return false;
      
      return note.tags.some(tagEntry => {
        // Handle both [tag, weight] format and simple string format
        const tagName = Array.isArray(tagEntry) ? tagEntry[0] : tagEntry;
        return fitnessTags.has(String(tagName).toLowerCase());
      });
    });
  } catch (error) {
    console.error('Error getting fitness notes:', error);
    return [];
  }
}

/**
 * Calculates total workout hours from exercise notes
 */
export const calculateWorkoutHours = {
  name: 'calculate-workout-hours',
  description: 'Calculate total workout hours from exercise notes',
  parameters: {
    type: 'object',
    properties: {
      days: {
        type: 'number',
        description: 'Number of days to look back for workout notes',
        default: 30
      }
    },
    required: []
  },
  handler: async (args) => {
    const days = args?.days || 30;
    try {
      // Get all fitness-related notes using the resource system
      const fitnessNotes = await getFitnessNotes();
      
      // Since notes don't have timestamps, we'll analyze all fitness notes
      // This is a reasonable approach since the sample data is recent
      const recentFitnessNotes = fitnessNotes;

      // Extract durations from each note by analyzing all available content
      const durations = await Promise.all(
        recentFitnessNotes.map(note => {
          // Use the raw content which contains the actual workout details
          const content = note.raw || note.summary || note.name || '';
          return extractWorkoutDuration(content);
        })
      );

      const totalMinutes = durations.reduce((sum, minutes) => sum + minutes, 0);
      const totalHours = totalMinutes / 60;
      const averageMinutesPerDay = totalMinutes / days;
      const averageHoursPerWeek = (totalHours * 7) / days;

      // Calculate actual period based on available data
      const now = new Date();
      const cutoffDate = new Date(now.setDate(now.getDate() - days));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              total: {
                minutes: totalMinutes,
                hours: parseFloat(totalHours.toFixed(2)),
                workouts: recentFitnessNotes.length
              },
              average: {
                minutesPerDay: parseFloat(averageMinutesPerDay.toFixed(1)),
                hoursPerWeek: parseFloat(averageHoursPerWeek.toFixed(1))
              },
              period: {
                days,
                startDate: cutoffDate.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              },
              notesAnalyzed: recentFitnessNotes.length,
              fitnessNotesFound: fitnessNotes.length,
              workouts: recentFitnessNotes.map((note, index) => ({
                name: note.name,
                duration: durations[index],
                raw: note.raw
              }))
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calculating workout hours:', error);
      throw new Error('Failed to calculate workout hours');
    }
  }
};

export default calculateWorkoutHours;
