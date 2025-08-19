// Resource schemas
export const resources = [
  {
    name: 'user',
    description: 'User information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique identifier for the user' },
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', format: 'email', description: 'Email address' },
        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
      },
      required: ['id', 'username', 'email', 'createdAt', 'updatedAt']
    }
  },
  {
    name: 'note',
    description: 'User note',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique identifier for the note' },
        userId: { type: 'string', description: 'ID of the user who owns the note' },
        title: { type: 'string', description: 'Title of the note' },
        content: { type: 'string', description: 'Content of the note' },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Tags associated with the note',
          default: []
        },
        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
      },
      required: ['id', 'userId', 'title', 'content', 'createdAt', 'updatedAt']
    }
  }
];

export default resources;
