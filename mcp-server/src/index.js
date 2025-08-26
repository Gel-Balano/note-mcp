import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MCP Server
const server = new McpServer({
  name: 'notes-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {
      'notes': {
        list: 'notes://list-all',
        read: 'notes://read/{id}'
      }
    },
    tools: {},
    prompts: {}
  },
});

// Helper function to read notes
const readNotes = async () => {
  const notesPath = path.join(__dirname, '../data/notes.json');
  const data = await fs.readFile(notesPath, 'utf-8');
  return JSON.parse(data);
};

// Resource: List all notes
server.resource(
  'notes',
  'notes://list-all',
  {
    description: 'Get all notes with optional search',
    title: 'Notes',
    mimeType: 'application/json',
  },
  async (uri, { search, limit = 10 } = {}) => {
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
      
      const result = notes.slice(0, parseInt(limit));
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            data: result,
            meta: {
              total: notes.length,
              returned: result.length,
              search: search || null,
              limit: parseInt(limit)
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
);

// Resource: Get single note by ID
server.resource(
  'note',
  new ResourceTemplate('notes://read/{id}', { list: undefined }),
  {
    description: 'Get a single note by its ID',
    title: 'Note',
    mimeType: 'application/json',
  },
  async (uri, { id }) => {
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
);

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.log('MCP Server started');
console.log('Available resources:');
console.log('  - GET notes://list-all - List all notes');
console.log('  - GET notes://read/{id} - Get a single note by ID');

export default server;
