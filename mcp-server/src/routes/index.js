import { db, generateId, getUserNotes } from '../helpers';
import { validateUserData, validateNoteData, checkExistingUser } from '../helpers/validation';

// Handle tool execution
export const handleToolExecution = async (toolName, parameters) => {
  switch (toolName) {
    case 'create_user':
      return await handleCreateUser(parameters);
    case 'create_note':
      return await handleCreateNote(parameters);
    case 'list_notes':
      return await handleListNotes(parameters);
    case 'update_note':
      return await handleUpdateNote(parameters);
    case 'delete_note':
      return await handleDeleteNote(parameters);
    case 'search_notes_by_tags':
      return await handleSearchNotesByTags(parameters);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};

// User Handlers
const handleCreateUser = async ({ username, email }) => {
  // Validate input
  const validationErrors = validateUserData({ username, email });
  if (validationErrors) {
    throw { status: 400, message: 'Validation error', details: validationErrors };
  }

  // Check for existing user
  const existingUser = checkExistingUser(username, email);
  if (existingUser) {
    const field = existingUser.username.toLowerCase() === username.toLowerCase() ? 'username' : 'email';
    throw { status: 409, message: 'Conflict', details: `User with this ${field} already exists` };
  }

  // Create new user
  const newUser = {
    id: `user_${generateId()}`,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to database
  db.users.set(newUser.id, newUser);
  db.userNotes.set(newUser.id, []);

  // Return response without internal ID
  const { id, ...userResponse } = newUser;
  return userResponse;
};

// Note Handlers
const handleCreateNote = async ({ userId, title, content, tags = [] }) => {
  // Validate user exists
  if (!db.users.has(userId)) {
    throw { status: 404, message: 'User not found' };
  }

  // Validate note data
  const validationErrors = validateNoteData({ title, content });
  if (validationErrors) {
    throw { status: 400, message: 'Validation error', details: validationErrors };
  }

  // Create new note
  const newNote = {
    id: `note_${generateId()}`,
    userId,
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.map(tag => tag.toString().trim()).filter(Boolean) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to database
  db.notes.set(newNote.id, newNote);
  
  // Update user's notes
  if (!db.userNotes.has(userId)) {
    db.userNotes.set(userId, []);
  }
  db.userNotes.get(userId).push(newNote.id);

  // Return response without content
  const { content: _, ...noteResponse } = newNote;
  return noteResponse;
};

const handleListNotes = async ({ userId, limit = 10, offset = 0, includeContent = false }) => {
  if (!db.users.has(userId)) {
    throw { status: 404, message: 'User not found' };
  }
  
  return getUserNotes(userId, { limit, offset, includeContent });
};

const handleUpdateNote = async ({ noteId, userId, title, content, tags }) => {
  // Check if note exists and belongs to user
  const note = db.notes.get(noteId);
  if (!note) {
    throw { status: 404, message: 'Note not found' };
  }
  
  if (note.userId !== userId) {
    throw { status: 403, message: 'Forbidden', details: 'You do not have permission to update this note' };
  }

  // Prepare updates
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content.trim();
  if (tags !== undefined) {
    updates.tags = Array.isArray(tags) ? tags.map(tag => tag.toString().trim()).filter(Boolean) : [];
  }

  // Update note
  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Save to database
  db.notes.set(noteId, updatedNote);

  // Return response without content
  const { content: _, ...noteResponse } = updatedNote;
  return noteResponse;
};

const handleDeleteNote = async ({ noteId, userId }) => {
  // Check if note exists and belongs to user
  const note = db.notes.get(noteId);
  if (!note) {
    throw { status: 404, message: 'Note not found' };
  }
  
  if (note.userId !== userId) {
    throw { status: 403, message: 'Forbidden', details: 'You do not have permission to delete this note' };
  }

  // Remove note from user's notes
  const userNotes = db.userNotes.get(userId) || [];
  const noteIndex = userNotes.indexOf(noteId);
  if (noteIndex > -1) {
    userNotes.splice(noteIndex, 1);
    db.userNotes.set(userId, userNotes);
  }

  // Delete the note
  db.notes.delete(noteId);

  return { success: true, message: 'Note deleted successfully' };
};

const handleSearchNotesByTags = async ({ userId, tags, matchAll = true, limit = 10, offset = 0 }) => {
  if (!db.users.has(userId)) {
    throw { status: 404, message: 'User not found' };
  }

  // Normalize tags
  const searchTags = tags.map(tag => tag.toLowerCase().trim());
  const userNoteIds = db.userNotes.get(userId) || [];
  
  // Filter notes by tags
  const matchingNotes = [];
  for (const noteId of userNoteIds) {
    const note = db.notes.get(noteId);
    if (!note) continue;
    
    const noteTags = note.tags.map(tag => tag.toLowerCase());
    
    let isMatch;
    if (matchAll) {
      // Match all tags
      isMatch = searchTags.every(tag => noteTags.includes(tag));
    } else {
      // Match any tag
      isMatch = searchTags.some(tag => noteTags.includes(tag));
    }
    
    if (isMatch) {
      matchingNotes.push(note);
    }
  }
  
  // Apply pagination and exclude content
  const paginatedNotes = matchingNotes
    .slice(offset, offset + limit)
    .map(({ content, ...note }) => note);
  
  return {
    items: paginatedNotes,
    pagination: {
      total: matchingNotes.length,
      limit,
      offset,
      hasMore: (offset + limit) < matchingNotes.length
    }
  };
};
