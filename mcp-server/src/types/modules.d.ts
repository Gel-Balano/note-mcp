declare module '*.js' {
  const content: any;
  export = content;
}

declare module './resources/notes.js' {
  export const allNotesResources: Array<{
    name: string;
    uri?: string;
    template?: any;
    handler: (uri: any, params?: any) => Promise<any>;
  }>;
  export default allNotesResources;
}

declare module './tools/workoutAnalysis.js' {
  export const calculateWorkoutHours: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: {
        [key: string]: {
          type: string;
          description?: string;
          default?: any;
        };
      };
      required: string[];
    };
    handler: (args: any) => Promise<{
      content: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  export default calculateWorkoutHours;
}