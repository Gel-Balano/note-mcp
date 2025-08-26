import { readNotes } from './src/resources/notes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Test function to verify getFitnessNotes works correctly
 */
async function testGetFitnessNotes() {
  try {
    const notes = await readNotes();
    
    // Define fitness-related tags
    const fitnessTags = new Set([
      'fitness', 'workout', 'exercise', 'training', 'gym', 'cardio', 'strength',
      'yoga', 'running', 'jogging', 'walking', 'swimming', 'cycling'
    ]);
    
    // Filter notes that contain fitness-related tags
    const fitnessNotes = notes.filter(note => {
      if (!note.tags || !Array.isArray(note.tags)) return false;
      
      return note.tags.some(tagEntry => {
        // Handle both [tag, weight] format and simple string format
        const tagName = Array.isArray(tagEntry) ? tagEntry[0] : tagEntry;
        return fitnessTags.has(String(tagName).toLowerCase());
      });
    });
    
    console.log('Total notes:', notes.length);
    console.log('Fitness notes found:', fitnessNotes.length);
    console.log('Fitness notes:');
    fitnessNotes.forEach(note => {
      console.log(`- ${note.name} (${note.tags.map(t => Array.isArray(t) ? t[0] : t).join(', ')})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGetFitnessNotes();