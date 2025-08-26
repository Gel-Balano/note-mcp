import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allNotesResources } from './resources/index.js';
import { calculateWorkoutHours } from './tools/index.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading environment from: ${envPath}`);
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('Error loading .env file:', envConfig.error);
} else {
  console.log('Environment variables loaded successfully');
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
}

// Initialize MCP Server with basic capabilities
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

// Register the workout hours tool
server.tool('calculate-workout-hours', calculateWorkoutHours.parameters, calculateWorkoutHours.handler);
console.log('Registered tool: calculate-workout-hours');

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
console.log('Available tools:');
console.log('  - calculate-workout-hours - Calculate total workout hours from exercise notes');
export default server;
