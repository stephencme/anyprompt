# AnyPrompt End-to-End Process

## Overview

AnyPrompt is an open-source prompt engineering editor designed to simplify and accelerate the process of testing, comparing, and deploying LLM prompts. It includes a web-based playground for iterating on prompts, version tracking, SDK integration, and real-time updates via a CLI tool.

### Tech Stack

**Frontend**

- React 19
- TypeScript
- Next.js 15.1.4
- TailwindCSS
- Vercel (Deployment)

**Backend**

- Supabase (Authentication)
- Supabase (PostgreSQL Database)
- Supabase (Realtime Updates)
- Next.js API Routes

**SDK**

- TypeScript
- Node.js
- npm Package

**LLM Integration**

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude Models)

### Key Features

AnyPrompt provides an intuitive interface and TypeScript SDK for:

- Designing and testing prompts in a collaborative editor
- Comparing responses from multiple LLMs such as OpenAI and Anthropic
- Storing prompt versions and managing prompt workflows
- Integrating prompts directly into applications via a lightweight SDK
- Using a CLI to manage and sync prompt changes in real time

This document outlines the complete end-to-end process of the AnyPrompt project, from user registration to prompt execution and result tracking.

## User Journey

### 1. User Registration & Authentication

1. **Signup Process**

   - User navigates to `/signup`
   - Enters email and password
   - System validates password (min 8 characters)
   - Supabase creates user account
   - Verification email sent to user
   - User clicks verification link
   - System establishes session
   - User redirected to prompts page

2. **Login Process**
   - User navigates to `/login`
   - Enters credentials
   - System authenticates with Supabase
   - Session established
   - User redirected to prompts page

### 2. API Key Configuration

1. **Access Settings**

   - User navigates to `/settings`
   - Enters API keys for desired providers
   - System encrypts keys using crypto-ts
   - Keys stored in Supabase database
   - Keys displayed in masked format

2. **Provider Support**
   - OpenAI API key configuration
   - Anthropic API key configuration
   - Key validation on save
   - Secure storage implementation

### 3. Prompt Management

1. **Creating Prompts**

   - User creates new prompt
   - Enters prompt name and description
   - Defines template variables
   - System creates prompt record
   - Version tracking initialized

2. **Version Control**
   - Each prompt can have multiple versions
   - Version history maintained
   - Template variables tracked
   - Timestamps for creation/updates

### 4. Prompt Execution

1. **Template Rendering**

   - User selects prompt version
   - Fills in template variables
   - System renders final prompt
   - Variables replaced in template

2. **Model Selection**

   - User chooses AI provider
   - Selects specific model
   - System validates API key
   - Model availability checked

3. **Execution Process**
   - Rendered prompt sent to selected model
   - API call made with user's key
   - Response received and processed
   - Result stored in run history

### 5. Result Management

1. **Run History**

   - Each execution recorded
   - Model used tracked
   - Timestamp recorded
   - Full prompt and result stored
   - Additional metadata saved

2. **Result Display**
   - Results shown to user
   - History accessible
   - Metadata available
   - Export capabilities

## Technical Implementation

### 1. Frontend Flow

```
User Action → React Component → API Route → Database → UI Update
```

### 2. Data Flow

```
User Input → Form Validation → API Call → Database → Response → UI Update
```

### 3. Security Flow

```
API Key → Encryption → Database Storage → Decryption → API Call
```

## Database Operations

### 1. User Management

- User creation in Supabase Auth
- Profile data storage
- Session management
- API key storage

### 2. Prompt Operations

- Prompt creation
- Version management
- Template storage
- Variable tracking

### 3. Execution Tracking

- Run history recording
- Result storage
- Metadata management
- Timestamp tracking

## Error Handling

### 1. User Input Errors

- Form validation
- API key validation
- Template variable validation
- Error message display

### 2. System Errors

- API call failures
- Database errors
- Authentication errors
- Network issues

### 3. Recovery Process

- Error logging
- User notification
- Fallback options
- Retry mechanisms

## Security Measures

### 1. Authentication

- Email verification
- Session management
- Protected routes
- Token handling

### 2. Data Protection

- API key encryption
- HTTPS communication
- Secure storage
- Input validation

### 3. Access Control

- Route protection
- API key validation
- User authorization
- Resource isolation

## Performance Considerations

### 1. Optimization

- Client-side rendering
- API response caching
- Database indexing
- Query optimization

### 2. Monitoring

- Error tracking
- Performance metrics
- Usage statistics
- System health

## Future Enhancements

### 1. Planned Features

- Additional authentication methods
- Enhanced API key management
- More provider integrations
- Advanced analytics

### 2. Technical Improvements

- Performance optimization
- Enhanced error handling
- Better testing coverage
- Documentation updates

## Development Workflow

### 1. Local Setup

1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Set up Supabase project
5. Run development server

### 2. Environment Configuration

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ENCRYPTION_SECRET_KEY=your_secret_key
```

### 3. Development Process

- Feature development
- Testing
- Code review
- Deployment

## Deployment Process

### 1. Preparation

- Environment configuration
- Database setup
- SSL certificate
- API key configuration

### 2. Deployment Steps

1. Build application
2. Configure environment
3. Deploy to platform
4. Verify functionality
5. Monitor performance

## API Reference

This section details the available API endpoints for AnyPrompt.

### Encryption/Decryption

- **`POST /api/encrypt`**

  - Encrypts a message.
  - **Request Body:** `{ "message": "string" }`
  - **Success (200):** `{ "encrypted": "string" }`
  - **Errors:** 400 (missing/invalid message), 500 (encryption failed)

- **`POST /api/decrypt`**
  - Decrypts an encrypted message.
  - **Request Body:** `{ "encrypted": "string" }`
  - **Success (200):** `{ "decrypted": "string" }`
  - **Errors:** 400 (missing/invalid encrypted message), 500 (decryption failed)

### API Keys

- **`POST /api/storeAPIKey`**

  - Stores or updates an encrypted API key for a user and provider.
  - **Request Body:** `{ "apiKey": "string", "provider": "string", "userId": "string" }`
  - **Success (200):** `{ "success": true }`
  - **Errors:** 400 (invalid input), 500 (storage failed)

- **`GET /api/fetchAPIKeys`**
  - Fetches all masked API keys for a user.
  - **Query Parameters:** `userId` (required)
  - **Success (200):** `{ "keys": [{ "id": "string", "provider": "string", "masked_api_key": "string", "created_at": "string" }] }`
  - **Errors:** 400 (missing userId), 500 (fetch failed)

### Models

- **`GET /api/models`**
  - Fetches available models for a provider using the user's stored key.
  - **Query Parameters:** `userId`, `provider` (both required)
  - **Success (200):** `{ "models": ["string"] }`
  - **Errors:** 400 (missing params), 404 (API key not found), 500 (fetch failed)

### Prompts

- **`POST /api/prompts`**

  - Creates a new prompt and its initial version.
  - **Query Parameters:** `userId` (required)
  - **Request Body:** `{ "name": "string", "description": "string" (optional), "template": "string", "version": "string", "templateVariables": "any" (optional) }`
  - **Success (200):** `{ "success": true, "id": "string" }`
  - **Errors:** 400 (missing userId or body fields), 500 (creation failed)

- **`GET /api/prompts`**

  - Fetches all prompts and their versions for a user.
  - **Query Parameters:** `userId` (required)
  - **Success (200):** `Array<Prompt & { versions: Array<{ version: string, prompt: string, template_variables: any }> }>`
  - **Errors:** 400 (missing userId), 500 (fetch failed)

- **`PUT /api/prompts/{id}`**

  - Updates prompt details and updates/creates a specific version.
  - **Path Parameters:** `id` (prompt ID)
  - **Request Body:** `{ "name": "string", "description": "string" (optional), "template": "string", "version": "string", "templateVariables": "any" (optional) }`
  - **Success (200):** `{ "success": true }`
  - **Errors:** 400 (missing body fields), 500 (update failed)

- **`DELETE /api/prompts/{id}`**
  - Deletes a prompt and all its versions.
  - **Path Parameters:** `id` (prompt ID)
  - **Success (200):** `{ "success": true }`
  - **Errors:** 500 (deletion failed)

### Prompt Versions

- **`POST /api/prompts/{id}/versions`**

  - Creates a new version for an existing prompt.
  - **Path Parameters:** `id` (prompt ID)
  - **Request Body:** `{ "version": "string", "prompt": "string", "templateVariables": "any" (optional) }`
  - **Success (200):** `PromptVersion Object`
  - **Errors:** 400 (missing fields or version exists), 500 (creation failed)

- **`GET /api/prompts/{id}/versions/{versionId}`**
  - Fetches details of a specific prompt version.
  - **Path Parameters:** `id` (prompt ID), `versionId` (version ID)
  - **Success (200):** `PromptVersion Object`
  - **Errors:** 404 (not found), 500 (fetch failed)

### Prompt Runs

- **`POST /api/run-prompt`**

  - Executes a prompt version with given parameters against a model.
  - **Request Body:** `{ "userID": "string", "promptID": "string", "provider": "string", "model": "string", "parameters": "Record<string, string>" }`
  - **Success (200):** `{ "result": "ProviderCompletionObject" }` (e.g., OpenAI or Anthropic response structure)
  - **Errors:** 400 (missing fields), 404 (key or template not found), 500 (execution or DB store failed)

- **`GET /api/prompts/{id}/versions/{versionId}/runs`**
  - Fetches the run history for a specific prompt version.
  - **Path Parameters:** `id` (prompt ID), `versionId` (version ID)
  - **Success (200):** `Array<RunHistory Object>`
  - **Errors:** 404 (version not found/mismatched), 500 (fetch failed)

## Maintenance

### 1. Regular Tasks

- Security updates
- Dependency updates
- Performance monitoring
- Error tracking

### 2. User Support

- Issue tracking
- Feature requests
- Bug fixes
- Documentation updates
