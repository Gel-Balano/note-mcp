import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { analyzeWorkout } from './workoutAnalysis.js';
import { createNote } from './createNote.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export function registerTools(server: Server): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'analyze_workout':
        return analyzeWorkout(args as any);
      
      case 'create_note':
        return createNote(args as any);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}