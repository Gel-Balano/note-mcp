import express from 'express';
import cors from 'cors';
import { createServer } from '@modelcontext/protocol';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import tools from './tools';
import resources from './resources';
import { handleToolExecution } from './routes';

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

// Initialize MCP server
const mcpServer = createServer({
  name: 'openai-mcp-server',
  version: '1.0.0',
  tools,
  resources,
  openai,
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Attach MCP server to Express
mcpServer.attach(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Endpoint to handle tool execution
app.post('/execute-tool', async (req, res) => {
  try {
    const { toolName, parameters } = req.body;
    
    // Find the tool
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
        details: `Tool '${toolName}' does not exist`
      });
    }
    
    // Execute the tool
    try {
      const result = await handleToolExecution(toolName, parameters);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to execute tool',
        details: error.details
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
  console.log('Available tools:');
  tools.forEach(tool => console.log(`- ${tool.name}: ${tool.description}`));
});

export default app;
