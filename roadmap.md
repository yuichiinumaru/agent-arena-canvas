
# Agent Arena Development Roadmap

## UI Improvements
- [x] Fix color scheme inconsistencies (black and red theme)
- [x] Add predefined agents with relevant descriptions
- [x] Move side menu to top navigation bar
- [x] Fix remaining white background areas in UI
- [x] Make the agent list sidebar width adjustable
- [x] Make all vertical dividers adjustable
- [x] Fix "Configuration" header and tabs repetition
- [x] Move top menu to prevent duplication across tabs
- [x] Add chat sidebar with conversation history
- [x] Add resizable chat panels
- [x] Add active agents display in chat interface

## Functionality Improvements
- [x] Fix tools section saving functionality
- [x] Add Knowledge section to store and manage documents
- [x] Implement document upload and viewing functionality
- [x] Create shared knowledge base between Agents and Knowledge sections
- [x] Add two view modes for Knowledge section (list and thumbnail)
- [x] Implement document viewer with metadata display
- [x] Fix conversation storage and retrieval (temporary localStorage solution until DB is ready)
- [ ] Create appropriate database tables for conversations
- [x] Add FastAPI to MCP conversion tool to help users create agent tools

## Chat Interface Enhancements
- [ ] Implement multiline text input for chat messages
- [ ] Add file upload functionality in chat interface
- [ ] Store files uploaded in chat into the document section
- [ ] Implement edit message functionality with pencil icon
- [ ] Implement delete message functionality with trash icon 
- [ ] Add "Copy chat to markdown" button to export conversations as .md files
- [ ] Implement automatic file download for exported markdown conversations

## Document Management Enhancements
- [ ] Implement agent write access control for documents
- [ ] Enable agents to read and process documents mentioned in chat
- [ ] Add UI for changing document write permissions in chat context
- [ ] Implement file copying mechanism for write-restricted documents
- [ ] Track documents created by agents and set appropriate permissions

## File Format Support
- [ ] Implement support for reading PDF files
- [ ] Implement support for Office suite files (docx, xlsx, pptx)
- [ ] Add support for image and video file analysis
- [ ] Research Gemini 2.5 Pro native file format support
- [ ] Implement adapters for file formats not natively supported
- [ ] Add file chunking mechanism for large files exceeding token limits
- [ ] Make token threshold configurable in Settings (default: 400k)

## Google Drive Integration
- [ ] Implement Google authentication in Settings
- [ ] Add Google Drive folder access and permission management
- [ ] Create file browser for Google Drive documents
- [ ] Implement read/write operations for Google Drive files
- [ ] Add syncing mechanism between local and Google Drive storage
- [ ] Implement collapsible file menu sections for local and Drive files

## Backend Integration
- [x] Setup Supabase functions to create required tables
- [ ] Implement proper error handling for database operations
- [ ] Add migration capabilities for older data
- [ ] Create Supabase RPC function for conversation operations
- [ ] Implement Google Drive API integration via Supabase edge functions
- [ ] Add file processing and conversion API for unsupported formats

## Code Quality
- [x] Add proper TypeScript type definitions for all components
- [ ] Implement consistent error handling across the application
- [ ] Add unit tests for critical functionality
- [x] Refactor long component files into smaller, more manageable files
- [x] Fix build errors in configuration files

## Future Enhancements
- [ ] Implement agent capabilities to write to different file types
- [ ] Research and implement image/video generation and editing capabilities
- [ ] Add collaborative document editing with multiple agents

## TODO Soon
- [ ] Create the conversations table in Supabase database
- [ ] Create proper RLS policies for conversation data
- [x] Improve agent/conversation integration
- [x] Fix the AgentContext.tsx file (refactor into smaller parts)
- [x] Implement proper error handling for Supabase operations
- [ ] Expand FastAPI to MCP converter with more advanced features
- [ ] Implement multiline text input for chat messages
- [ ] Add file upload button for chat interface
