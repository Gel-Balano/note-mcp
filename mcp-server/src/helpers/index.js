// In-memory database
export const db = {
  users: new Map(),
  notes: new Map(),
  userNotes: new Map(), // Maps userId to array of noteIds
};

// Generate a unique ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Get paginated notes for a user
export const getUserNotes = (userId, { limit = 10, offset = 0, includeContent = false } = {}) => {
  const noteIds = db.userNotes.get(userId) || [];
  const total = noteIds.length;
  const paginatedNoteIds = noteIds.slice(offset, offset + limit);
  
  const notes = paginatedNoteIds.map(noteId => {
    const note = db.notes.get(noteId);
    if (!note) return null;
    
    // Create a copy of the note to avoid modifying the original
    const noteCopy = { ...note };
    
    // Remove content if not needed in the response
    if (!includeContent) {
      delete noteCopy.content;
    }
    
    return noteCopy;
  }).filter(Boolean); // Filter out any null values
  
  return {
    items: notes,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  };
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate note data
export const validateNoteData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Note title cannot be empty');
  }
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Note content cannot be empty');
  }
  
  return errors.length === 0 ? null : errors;
};

// Validate user data
export const validateUserData = (data) => {
  const errors = [];
  
  if (!data.username || data.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  return errors.length === 0 ? null : errors;
};

// Check if username or email already exists
export const checkExistingUser = (username, email) => {
  const users = Array.from(db.users.values());
  return users.find(user => 
    user.username.toLowerCase() === username.toLowerCase() || 
    user.email.toLowerCase() === email.toLowerCase()
  );
};
