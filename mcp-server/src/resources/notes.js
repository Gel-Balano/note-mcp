import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to read notes
const readNotes = async () => {
  const notesPath = join(__dirname, '../../data/notes.json');
  const data = await fs.readFile(notesPath, 'utf-8');
  return JSON.parse(data);
};

export const listAllNotes = {
  name: 'list-notes',
  uri: 'notes://list-all',
  config: {
    description: 'Get all notes with optional search',
    title: 'Notes',
    mimeType: 'application/json',
  },
  handler: async (uri, { search, limit = 10, offset = 0 } = {}) => {
    try {
      let notes = await readNotes();
      
      if (search) {
        const searchLower = search.toLowerCase();
        notes = notes.filter(note => 
          (note.name && note.name.toLowerCase().includes(searchLower)) ||
          (note.raw && note.raw.toLowerCase().includes(searchLower)) ||
          (note.summary && note.summary.toLowerCase().includes(searchLower))
        );
      }
      
      // Convert limit and offset to numbers and handle pagination
      limit = Number(limit) || 10;
      offset = Number(offset) || 0;
      
      const paginatedNotes = notes.slice(offset, offset + limit);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            data: paginatedNotes,
            meta: {
              total: notes.length,
              count: paginatedNotes.length,
              search: search || null,
              limit: parseInt(limit),
              offset: parseInt(offset)
            }
          }),
          mimeType: 'application/json',
        }]
      };
    } catch (error) {
      console.error('Error reading notes:', error);
      throw new Error('Failed to fetch notes');
    }
  }
};

export const getNoteById = {
  name: 'note',
  template: new ResourceTemplate('notes://read/{id}', { list: undefined }),
  config: {
    description: 'Get a single note by its ID',
    title: 'Note',
    mimeType: 'application/json',
  },
  handler: async (uri, { id }) => {
    try {
      const notes = await readNotes();
      const note = notes.find(n => n.id === id);
      
      if (!note) {
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: 'Note not found' }),
            mimeType: 'application/json',
          }],
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({ data: note }),
          mimeType: 'application/json',
        }],
      };
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Failed to fetch note');
    }
  }
};

export const getNotesByTag = {
  name: 'notes-by-tag',
  template: new ResourceTemplate('notes://by-tag/{tag}', { list: undefined }),
  config: {
    description: 'Get notes by tag',
    title: 'Notes by Tag',
    mimeType: 'application/json',
  },
  handler: async (uri, { tag, limit = 10, offset = 0 }) => {
    try {
      if (!tag) {
        throw new Error('Tag parameter is required');
      }
      
      const notes = await readNotes();
      
      // Find all notes that have the specified tag
      const matchingNotes = notes.filter(note => 
        note.tags && note.tags.some(([t]) => t.toLowerCase() === tag.toLowerCase())
      );
      
      // Convert limit and offset to numbers with defaults
      limit = Number(limit) || 10;
      offset = Number(offset) || 0;
      
      // Apply pagination
      const paginatedNotes = matchingNotes.slice(offset, offset + limit);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            data: paginatedNotes,
            meta: {
              total: matchingNotes.length,
              count: paginatedNotes.length,
              tag,
              limit: limit,
              offset: offset
            }
          }),
          mimeType: 'application/json',
        }]
      };
    } catch (error) {
      console.error('Error fetching notes by tag:', error);
      throw new Error('Failed to fetch notes by tag');
    }
  }
};

export const allNotesResources = [
  listAllNotes,
  getNoteById,
  getNotesByTag
];
