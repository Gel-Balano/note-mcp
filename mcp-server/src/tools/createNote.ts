import { promises as fs } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CreateNoteInput {
  title: string;
  content: string;
  type: 'workout' | 'nutrition' | 'general';
  tags?: string[];
  metadata?: Record<string, any>;
}

export async function createNote(input: CreateNoteInput): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  const { title, content, type, tags = [], metadata = {} } = input;
  
  const newNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    content,
    type,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata,
  };

  try {
    const notesPath = join(__dirname, '..', '..', 'data', 'notes.json');
    const notesData = await fs.readFile(notesPath, 'utf8');
    const notes = JSON.parse(notesData);
    
    notes.push(newNote);
    
    await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            note: newNote,
            message: 'Note created successfully'
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Failed to create note',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }
      ]
    };
  }
}

// Define the createNote tool structure
export const createNoteTool = {
  name: 'create-note',
  description: 'Create a new note with specified type and metadata',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Title of the note'
      },
      content: {
        type: 'string',
        description: 'Content of the note'
      },
      type: {
        type: 'string',
        description: 'Type of note (workout, nutrition, or general)',
        enum: ['workout', 'nutrition', 'general']
      },
      tags: {
        type: 'array',
        description: 'Array of tags for categorization (optional)',
        items: {
          type: 'string'
        }
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata as key-value pairs (optional)'
      }
    },
    required: ['title', 'content', 'type']
  },
  handler: createNote
};

export default createNoteTool;