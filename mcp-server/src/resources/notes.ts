import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Note } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class NotesService {
  private notesPath: string;

  constructor() {
    // Go up two levels from src/resources to reach project root, then into data
    this.notesPath = join(__dirname, '..', '..', 'data', 'notes.json');
  }

  private async logToFile(message: string) {
    try {
      const logPath = join(process.cwd(), 'debug.log');
      const timestamp = new Date().toISOString();
      await fs.appendFile(logPath, `[${timestamp}] ${message}\n`, 'utf8');
    } catch (err) {
      // If we can't log, there's not much we can do
    }
  }

  private async safeReadFile(path: string): Promise<string> {
    try {
      return await fs.readFile(path, 'utf8');
    } catch (error) {
      await this.logToFile(`Failed to read file at ${path}: ${error}`);
      throw error;
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      await this.logToFile(`Looking for notes file at: ${this.notesPath}`);
      
      try {
        await fs.access(this.notesPath);
      } catch (accessError) {
        const errorMsg = `Notes file does not exist at path: ${this.notesPath}\nCWD: ${process.cwd()}`;
        await this.logToFile(errorMsg);
        return [];
      }
      
      const data = await this.safeReadFile(this.notesPath);
      const notes = JSON.parse(data);
      await this.logToFile(`Successfully loaded ${notes.length} notes`);
      return notes;
    } catch (error) {
      await this.logToFile(`Error reading notes: ${error}`);
      return [];
    }
  }

  async getNotesByType(type: 'workout' | 'nutrition' | 'general'): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter(note => note.type === type);
  }

  async getNotesByTags(tags: string[]): Promise<Note[]> {
    const notes = await this.getAllNotes();
    console.error(`Raw tags input: ${JSON.stringify(tags)}`);
    
    // Decode URL-encoded tags, trim, and remove empty strings
    const decodedTags = tags
      .map(tag => decodeURIComponent(tag).trim())
      .filter(Boolean);
      
    console.error(`Decoded tags: ${JSON.stringify(decodedTags)}`);
    
    const filteredNotes = notes.filter(note => {
      if (!Array.isArray(note.tags)) {
        console.error(`Note ${note.id} has no tags array`);
        return false;
      }
      
      // Get all tag names from the note for easier debugging
      const noteTagNames = note.tags.map(([tagName]) => tagName);
      console.error(`Checking note ${note.id} with tags: ${JSON.stringify(noteTagNames)}`);
      
      // Check if note has any of the requested tags (OR condition)
      const hasAnyTag = decodedTags.some(searchedTag => {
        return note.tags.some(([tagName]) => {
          const isMatch = tagName === searchedTag;
          console.error(`Comparing '${tagName}' with '${searchedTag}': ${isMatch}`);
          return isMatch;
        });
      });
      
      if (!hasAnyTag) {
        console.error(`Note ${note.id} has none of the requested tags`);
      }
      
      console.error(`Note ${note.id} has any matching tag: ${hasAnyTag}`);
      return hasAnyTag;
    });
    
    console.error(`Found ${filteredNotes.length} notes matching all tags: ${JSON.stringify(decodedTags)}`);
    return filteredNotes;
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    // Ensure tags are in the correct format [string, number]
    const formattedTags: [string, number][] = (note.tags || []).map(tag => 
      Array.isArray(tag) ? [tag[0], tag[1] || 0] as [string, number] : [tag, 0] as [string, number]
    );

    const newNote: Note = {
      ...note,
      tags: formattedTags,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notes = await this.getAllNotes();
    notes.push(newNote);
    
    await fs.writeFile(this.notesPath, JSON.stringify(notes, null, 2));
    
    return newNote;
  }
}

// Define the resource handlers
async function listAllNotesHandler(uri: string | URL) {
  const service = new NotesService();
  const notes = await service.getAllNotes();
  const uriStr = typeof uri === 'string' ? uri : uri.toString();
  
  return {
    contents: [{
      uri: uriStr,
      mimeType: 'application/json',
      text: JSON.stringify(notes, null, 2)
    }]
  };
}

async function getNoteByIdHandler(uri: string | URL) {
  const service = new NotesService();
  const notes = await service.getAllNotes();
  const uriStr = typeof uri === 'string' ? uri : uri.toString();
  const id = uriStr.split('/').pop();
  const note = notes.find(n => n.id === id);
  
  if (!note) {
    throw new Error(`Note with ID ${id} not found`);
  }
  
  return {
    contents: [{
      uri: uriStr,
      mimeType: 'application/json',
      text: JSON.stringify(note, null, 2)
    }]
  };
}

async function getNotesByTagHandler(uri: string | URL) {
  const service = new NotesService();
  const uriStr = typeof uri === 'string' ? uri : uri.toString();
  
  console.error(`Processing URI: ${uriStr}`);
  
  // Extract the tags from the URI
  const url = new URL(uriStr);
  const tagParam = url.searchParams.get('tag') || '';
  
  console.error(`Extracted tags parameter: '${tagParam}'`);
  
  if (!tagParam) {
    throw new Error('No tags specified in the query parameters');
  }
  
  // Split by comma and trim whitespace from each tag
  const tags = tagParam
    .split(',')
    .map(tag => decodeURIComponent(tag).trim())
    .filter(Boolean);
  
  console.error(`Split into tags: ${JSON.stringify(tags)}`);
  
  if (tags.length === 0) {
    throw new Error('No valid tags specified');
  }
  
  console.error(`Calling getNotesByTags with tags: ${JSON.stringify(tags)}`);
  const notes = await service.getNotesByTags(tags);
  
  return {
    contents: [{
      uri: uriStr,
      mimeType: 'application/json',
      text: JSON.stringify(notes, null, 2)
    }]
  };
}

// Export the resource definitions
export const allNotesResources = [
  {
    uri: 'notes://list-all',
    name: 'List All Notes',
    description: 'Get all notes from the system',
    mimeType: 'application/json',
    handler: listAllNotesHandler
  },
  {
    uri: 'notes://read',
    name: 'Get Note by ID',
    description: 'Get a specific note by its ID',
    mimeType: 'application/json',
    handler: getNoteByIdHandler,
    uriTemplate: 'notes://read/{id}'
  },
  {
    uri: 'notes://by-tag',
    name: 'Get Notes by Tag',
    description: 'Get all notes filtered by tag',
    mimeType: 'application/json',
    handler: getNotesByTagHandler,
    uriTemplate: 'notes://by-tag?tag={tag}'
  }
];

export default allNotesResources;