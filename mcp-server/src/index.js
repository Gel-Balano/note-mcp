import express from 'express';
import cors from 'cors';
import { createServer } from '@modelcontext/protocol';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example tool
const tools = [
  {
    name: 'get_weather',
    description: 'Get the current weather in a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: { 
          type: 'string', 
          enum: ['celsius', 'fahrenheit'] 
        },
      },
      required: ['location'],
    },
  },
  // Add more tools here
];

// Example resource
const resources = [
  {
    name: 'weather_data',
    description: 'Current weather data for various locations',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        temperature: { type: 'number' },
        unit: { type: 'string' },
        condition: { type: 'string' },
      },
    },
  },
  // Add more resources here
];

// Initialize MCP server
const mcpServer = createServer({
  name: 'openai-mcp-server',
  version: '1.0.0',
  tools,
  resources,
});

// Example endpoint to handle tool execution
app.post('/execute-tool', async (req, res) => {
  try {
    const { toolName, parameters } = req.body;
    
    // Find the tool
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Execute the tool
    let result;
    if (toolName === 'get_weather') {
      // Simulate weather API call
      result = {
        location: parameters.location,
        temperature: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40
        unit: parameters.unit || 'celsius',
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
      };
    }
    
    res.json({ result });
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({ error: 'Failed to execute tool' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
});

export default app;
