import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import path from 'path';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';

// Import the actual JavaScript modules with type assertions
const notesModule: any = await import('./resources/notes.js');
const toolsModule: any = await import('./tools/workoutAnalysis.js');

const allNotesResources = notesModule.allNotesResources;
const calculateWorkoutHours = toolsModule.calculateWorkoutHours;

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.error(`Loading environment from: ${envPath}`);
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('Error loading .env file:', envConfig.error);
} else {
  console.error('Environment variables loaded successfully');
  console.error('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
}

// Initialize MCP Server with basic capabilities
const server = new McpServer({
  name: 'notes-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {}
  },
});

// Register the workout hours tool
server.tool('calculate-workout-hours', calculateWorkoutHours.parameters, calculateWorkoutHours.handler);
console.error('Registered tool: calculate-workout-hours');

// Register all note resources
allNotesResources.forEach((resource: any) => {
  if (resource.uriTemplate) {
    // Register as a resource with template parameters
    server.registerResource(
      resource.name,  // Resource name
      new ResourceTemplate(resource.uriTemplate, { list: undefined }),  // URI template with parameters
      {  // Resource metadata
        title: resource.name,
        description: resource.description,
        mimeType: resource.mimeType || 'application/json'
      },
      resource.handler  // Handler function
    );
  } else {
    // Register as a regular resource
    server.registerResource(
      resource.name,  // Resource name
      resource.uri,   // Static URI
      {  // Resource metadata
        title: resource.name,
        description: resource.description,
        mimeType: resource.mimeType || 'application/json'
      },
      resource.handler  // Handler function
    );
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

export default server;