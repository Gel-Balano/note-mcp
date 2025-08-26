import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allNotesResources } from './resources/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize MCP Server with capabilities
const server = new McpServer({
  name: 'notes-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {
      'notes': {
        list: 'notes://list-all',
        read: 'notes://read/{id}'
      },
      'notes-by-tag': {
        read: 'notes://by-tag/{tag}'
      }
    },
    tools: {},
    prompts: {}
  },
});

// Register all note resources
allNotesResources.forEach(resource => {
  if (resource.template) {
    server.resource(
      resource.name,
      resource.template,
      resource.config,
      resource.handler
    );
  } else {
    server.resource(
      resource.name,
      resource.uri,
      resource.config,
      resource.handler
    );
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.log('MCP Server started');
console.log('Available resources:');
console.log('  - GET notes://list-all - List all notes');
console.log('  - GET notes://read/{id} - Get a single note by ID');
console.log('  - GET notes://by-tag/{tag} - Get notes by tag');
console.log('  - GET notes://by-tags?tags=tag1,tag2&matchAll=true - Get notes by multiple tags');

export default server;
