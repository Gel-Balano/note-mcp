export const tools = [
  // User Management
  {
    name: 'create_user',
    description: 'Create a new user',
    parameters: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Unique username for the new user (min 3 characters)',
          minLength: 3,
        },
        email: {
          type: 'string',
          description: 'Email address of the user',
          format: 'email',
        },
      },
      required: ['username', 'email'],
    },
  },
  
  // Note Management
  {
    name: 'create_note',
    description: 'Create a new note',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user creating the note',
        },
        title: {
          type: 'string',
          description: 'Title of the note',
          minLength: 1,
        },
        content: {
          type: 'string',
          description: 'Content of the note',
          minLength: 1,
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Tags to associate with the note',
          default: [],
        },
      },
      required: ['userId', 'title', 'content'],
    },
  },
  {
    name: 'list_notes',
    description: 'List all notes for a user',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user whose notes to list',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of notes to return',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        offset: {
          type: 'number',
          description: 'Number of notes to skip',
          minimum: 0,
          default: 0,
        },
        includeContent: {
          type: 'boolean',
          description: 'Whether to include full note content in the response',
          default: false,
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'update_note',
    description: 'Update an existing note',
    parameters: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to update',
        },
        userId: {
          type: 'string',
          description: 'ID of the user who owns the note',
        },
        title: {
          type: 'string',
          description: 'New title for the note',
          minLength: 1,
        },
        content: {
          type: 'string',
          description: 'New content for the note',
          minLength: 1,
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'New tags for the note',
        },
      },
      required: ['noteId', 'userId'],
    },
  },
  {
    name: 'delete_note',
    description: 'Delete a note',
    parameters: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to delete',
        },
        userId: {
          type: 'string',
          description: 'ID of the user who owns the note',
        },
      },
      required: ['noteId', 'userId'],
    },
  },
  {
    name: 'search_notes_by_tags',
    description: 'Search notes by tags',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user whose notes to search',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Tags to search for',
          minItems: 1,
        },
        matchAll: {
          type: 'boolean',
          description: 'If true, notes must match all tags. If false, notes matching any tag will be returned',
          default: true,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of notes to return',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        offset: {
          type: 'number',
          description: 'Number of notes to skip',
          minimum: 0,
          default: 0,
        },
      },
      required: ['userId', 'tags'],
    },
  },
];

export default tools;
