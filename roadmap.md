
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

## Backend Integration
- [x] Setup Supabase functions to create required tables
- [ ] Implement proper error handling for database operations
- [ ] Add migration capabilities for older data
- [ ] Create Supabase RPC function for conversation operations

## Code Quality
- [x] Add proper TypeScript type definitions for all components
- [ ] Implement consistent error handling across the application
- [ ] Add unit tests for critical functionality
- [x] Refactor long component files into smaller, more manageable files
- [x] Fix build errors in configuration files

## TODO Soon
- [ ] Create the conversations table in Supabase database
- [ ] Create proper RLS policies for conversation data
- [x] Improve agent/conversation integration
- [x] Fix the AgentContext.tsx file (refactor into smaller parts)
- [x] Implement proper error handling for Supabase operations
- [ ] Expand FastAPI to MCP converter with more advanced features
