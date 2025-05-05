# AnyPrompt Documentation

## Project Overview
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

## Technical Implementation

### Database Schema

#### Tables

##### 1. prompts
```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### 2. prompt_version
```sql
CREATE TABLE prompt_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    prompt TEXT NOT NULL,
    template_variables TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### 3. run_history
```sql
CREATE TABLE run_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_version UUID REFERENCES prompt_version(id) ON DELETE CASCADE,
    model VARCHAR NOT NULL,
    run_result TEXT,
    user_prompt TEXT,
    run_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_metadata JSONB
);
```

##### 4. user_api_keys
```sql
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Type Definitions

#### 1. Database Types
```typescript
interface Prompt {
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface PromptVersion {
    id: string;
    prompt_id: string;
    version: string;
    prompt: string;
    template_variables: string[];
    created_at: string;
    updated_at: string;
}

interface RunHistory {
    id: string;
    prompt_version: string;
    model: string;
    run_result: string | null;
    user_prompt: string | null;
    run_timestamp: string;
    additional_metadata: Record<string, any> | null;
}

interface UserApiKey {
    id: string;
    user_id: string;
    provider: 'openai' | 'anthropic';
    encrypted_api_key: string;
    created_at: string;
    updated_at: string;
}
```

#### 2. Context Types
```typescript
interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthLoading: boolean;
}

interface SettingsContextType {
    apiKeys: {
        openai: string | null;
        anthropic: string | null;
    };
    setApiKey: (provider: string, key: string) => Promise<void>;
    isSaving: boolean;
    error: string | null;
}
```

### Store Keys

#### 1. Local Storage Keys
```typescript
const STORAGE_KEYS = {
    AUTH_TOKEN: 'anyprompt_auth_token',
    REFRESH_TOKEN: 'anyprompt_refresh_token',
    USER_DATA: 'anyprompt_user_data',
    THEME: 'anyprompt_theme',
    LAST_VISITED: 'anyprompt_last_visited'
} as const;
```

#### 2. Session Storage Keys
```typescript
const SESSION_KEYS = {
    TEMP_API_KEY: 'anyprompt_temp_api_key',
    FORM_DATA: 'anyprompt_form_data',
    REDIRECT_PATH: 'anyprompt_redirect_path'
} as const;
```

### Encryption/Decryption

#### 1. API Key Encryption
```typescript
import { AES, enc } from 'crypto-ts';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY;

export const encryptApiKey = (key: string): string => {
    if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key not configured');
    }
    return AES.encrypt(key, ENCRYPTION_KEY).toString();
};

export const decryptApiKey = (encryptedKey: string): string => {
    if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key not configured');
    }
    const bytes = AES.decrypt(encryptedKey, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
};
```

#### 2. Token Encryption
```typescript
export const encryptToken = (token: string): string => {
    return AES.encrypt(token, ENCRYPTION_KEY).toString();
};

export const decryptToken = (encryptedToken: string): string => {
    const bytes = AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
};
```

### API Integration

#### 1. OpenAI Integration
```typescript
interface OpenAIConfig {
    apiKey: string;
    model: 'gpt-4' | 'gpt-3.5-turbo';
    temperature?: number;
    max_tokens?: number;
}

const openAIClient = {
    async generateCompletion(config: OpenAIConfig, prompt: string) {
        // Implementation
    },
    async validateApiKey(apiKey: string): Promise<boolean> {
        // Implementation
    }
};
```

#### 2. Anthropic Integration
```typescript
interface AnthropicConfig {
    apiKey: string;
    model: 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku';
    temperature?: number;
    max_tokens?: number;
}

const anthropicClient = {
    async generateCompletion(config: AnthropicConfig, prompt: string) {
        // Implementation
    },
    async validateApiKey(apiKey: string): Promise<boolean> {
        // Implementation
    }
};
```

### Authentication Flow

#### 1. Signup Process
```typescript
interface SignupData {
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Handles the user signup process
 * @param data - User signup data
 * @returns Promise that resolves when signup is complete
 */
const handleSignup = async (data: SignupData) => {
    // 1. Validate password
    // 2. Create Supabase user
    // 3. Send verification email
    // 4. Handle response
};
```

#### 2. Login Process
```typescript
interface LoginData {
    email: string;
    password: string;
}

/**
 * Handles the user login process
 * @param data - User login credentials
 * @returns Promise that resolves when login is complete
 */
const handleLogin = async (data: LoginData) => {
    // 1. Authenticate with Supabase
    // 2. Store session
    // 3. Redirect to dashboard
};
```

#### 3. Email Verification
The email verification process uses a React component with useEffect to handle the verification flow. The useEffect hook runs when the component mounts and processes the authentication tokens from the URL.

```typescript

const ConfirmEmail = () => {
    // 1. User signs up with email and password
    // 2. Supabase sends a verification email with a unique link
    // 3. User clicks the verification link in their email
    // 4. Link redirects to the /email-confirmed route
    // 5. ConfirmEmail component mounts and processes the URL tokens
    // 6. Supabase session is established with the provided tokens
    // 7. User is redirected to the main application (/prompts)
    // 8. User can now access protected routes and features

}
```
### Error Handling

#### 1. API Error Types
```typescript
interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

const ERROR_CODES = {
    INVALID_CREDENTIALS: 'auth/invalid-credentials',
    EMAIL_IN_USE: 'auth/email-already-in-use',
    INVALID_API_KEY: 'api/invalid-key',
    RATE_LIMIT: 'api/rate-limit',
    NETWORK_ERROR: 'network/error'
} as const;
```

#### 2. Error Handlers
```typescript
/**
 * Handles API errors and returns appropriate user-facing messages
 * @param error - The API error to handle
 * @returns Formatted error message for display
 */
const handleAPIError = (error: APIError) => {
    switch (error.code) {
        case ERROR_CODES.INVALID_CREDENTIALS:
            // Handle invalid credentials
            break;
        case ERROR_CODES.EMAIL_IN_USE:
            // Handle email in use
            break;
        // ... other cases
    }
};
```

### State Management

#### 1. Auth Store
```typescript
interface AuthStore {
    user: User | null;
    isAuthLoading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
}
```

#### 2. Settings Store
```typescript
interface SettingsStore {
    apiKeys: Record<string, string | null>;
    isSaving: boolean;
    error: string | null;
    saveApiKey: (provider: string, key: string) => Promise<void>;
    validateApiKey: (provider: string, key: string) => Promise<boolean>;
    clearApiKey: (provider: string) => Promise<void>;
}
```

### Security Measures

#### 1. Password Requirements
```typescript
const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
} as const;

const validatePassword = (password: string): boolean => {
    // Password Validation Process:
    // 1. Check minimum length (8 characters)
    // 2. Verify uppercase letter requirement
    // 3. Verify lowercase letter requirement
    // 4. Verify number requirement
    // 5. Verify special character requirement
    // 6. Return true if all requirements are met
    // 7. Return false if any requirement fails
    // Implementation
};
```

#### 2. API Key Security
```typescript
const API_KEY_SECURITY = {
    minLength: 32,
    maxLength: 256,
    allowedChars: /^[A-Za-z0-9-_]+$/,
    encryptionAlgorithm: 'AES-256-GCM'
} as const;
```

### Environment Variables
```typescript
interface EnvConfig {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    ENCRYPTION_SECRET_KEY: string;
}
```

### Prompt Routes
```typescript
// /api/prompts
// /api/prompts/[id]
// /api/prompts/[id]/versions
// /api/prompts/[id]/run
```

### Utility Functions

#### 1. Validation
```typescript
const validators = {
    email: (email: string): boolean => {
        // Email Validation Process:
        // 1. Check for valid email format (user@domain.tld)
        // 2. Verify domain has valid TLD
        // 3. Ensure no invalid characters
        // 4. Return true if email is valid
        // 5. Return false if validation fails
        // Implementation
    },
    password: (password: string): boolean => {
        // Password Validation Process:
        // 1. Check minimum length (8 characters)
        // 2. Verify uppercase letter requirement
        // 3. Verify lowercase letter requirement
        // 4. Verify number requirement
        // 5. Verify special character requirement
        // 6. Return true if all requirements are met
        // 7. Return false if any requirement fails
        // Implementation
    },
    apiKey: (key: string, provider: string): boolean => {
        // API Key Validation Process:
        // 1. Check key length requirements
        // 2. Verify key format based on provider
        // 3. Validate character set
        // 4. Check for provider-specific patterns
        // 5. Return true if key is valid
        // 6. Return false if validation fails
        // Implementation
    }
};
```

#### 2. Formatting
```typescript
const formatters = {
    maskApiKey: (key: string): string => {
        // API Key Masking Process:
        // 1. Extract first 4 characters
        // 2. Extract last 4 characters
        // 3. Replace middle characters with asterisks
        // 4. Return masked format: "XXXX...XXXX"
        // Implementation
    },
    formatDate: (date: Date): string => {
        // Date Formatting Process:
        // 1. Parse input date
        // 2. Format to local timezone
        // 3. Apply consistent date format
        // 4. Return formatted date string
        // Implementation
    },
    formatError: (error: Error): string => {
        // Error Formatting Process:
        // 1. Extract error message
        // 2. Format error details
        // 3. Add timestamp if needed
        // 4. Return formatted error string
        // Implementation
    }
};
```

### Deployment Configuration

#### 1. Build Configuration
```typescript
const buildConfig = {
    output: 'standalone',
    poweredByHeader: false,
    compress: true,
    generateEtags: true
};
```

### API Routes

The application uses Next.js API routes to handle various backend operations. All API routes are located in the `/web/app/api` directory.

#### 1. Authentication & Security
```typescript
// /api/encrypt/route.ts
// Handles encryption of sensitive data
POST /api/encrypt
Request: { message: string }
Response: { encrypted: string }

// /api/decrypt/route.ts
// Handles decryption of sensitive data
POST /api/decrypt
Request: { encrypted: string }
Response: { decrypted: string }
```

#### 2. API Key Management
```typescript
// /api/storeAPIKey/route.ts
// Stores encrypted API keys for different providers
POST /api/storeAPIKey
Request: { 
    apiKey: string,
    provider: string,
    userId: string 
}
Response: { success: boolean }

// /api/fetchAPIKeys/route.ts
// Retrieves masked API keys for a user
GET /api/fetchAPIKeys?userId={userId}
Response: { 
    keys: Array<{
        id: string,
        provider: string,
        masked_api_key: string,
        created_at: string
    }> 
}
```

#### 3. Model Management
```typescript
// /api/models/route.ts
// Fetches available models for a provider
GET /api/models?userId={userId}&provider={provider}
Response: { models: string[] }
```

#### 4. Prompt Management
```typescript
// /api/prompts/route.ts
// Main prompts endpoint
GET /api/prompts?userId={userId}
Response: Array<{
    id: string,
    name: string,
    description: string,
    versions: Array<{
        version: string,
        prompt: string,
        template_variables: string[]
    }>
}>

POST /api/prompts?userId={userId}
Request: {
    name: string,
    description: string,
    template: string,
    version: string,
    templateVariables: string[]
}
Response: { success: boolean, id: string }

// /api/prompts/[id]/route.ts
// Individual prompt operations
PUT /api/prompts/{id}
Request: {
    name: string,
    description: string,
    template: string,
    version: string,
    templateVariables: string[]
}
Response: { success: boolean }

DELETE /api/prompts/{id}
Response: { success: boolean }

// /api/prompts/[id]/versions/route.ts
// Prompt version management
POST /api/prompts/{id}/versions
Request: {
    version: string,
    prompt: string,
    templateVariables: string[]
}
Response: { id: string, ... }

// /api/prompts/[id]/versions/[versionId]/route.ts
// Individual version operations
GET /api/prompts/{id}/versions/{versionId}
Response: {
    id: string,
    prompt: string,
    template_variables: string[],
    version: string
}

// /api/prompts/[id]/versions/[versionId]/runs/route.ts
// Run history for a specific version
GET /api/prompts/{id}/versions/{versionId}/runs
Response: Array<{
    id: string,
    model: string,
    run_result: string,
    run_timestamp: string,
    additional_metadata: any
}>
```

#### 5. Prompt Execution
```typescript
// /api/run-prompt/route.ts
// Executes a prompt with specified parameters
POST /api/run-prompt
Request: {
    userID: string,
    promptID: string,
    provider: string,
    model: string,
    parameters: Record<string, string>
}
Response: {
    result: {
        content: string,
        role: string
    }
}
```

#### Error Handling
All API routes follow a consistent error handling pattern:
1. Input validation with appropriate error messages
2. Try-catch blocks for error handling
3. Standardized error response format:
```typescript
{
    error: string,
    status: number
}
```

#### Security Measures
1. API keys are encrypted before storage
2. User authentication required for all routes
3. Input validation on all endpoints
4. Error messages are sanitized
5. Rate limiting on sensitive endpoints
```

### Settings Management

The settings page (`/web/app/settings`) provides a user interface for managing account settings and API keys.

#### 1. Settings Page Structure
```typescript
// Settings Page Components
interface SettingsPage {
    // User Information Section
    - Username display
    - Sign out button
    - Password change functionality

    // API Key Management Section
    - OpenAI API key input and management
    - Anthropic API key input and management
    - Key masking for security
    - Save/Update functionality
}
```

#### 2. API Key Management
```typescript
// API Key Operations
interface APIKeyOperations {
    // Fetch API Keys
    fetchKeys(): Promise<void> {
        // 1. Retrieve masked API keys from server
        // 2. Update local state with key information
        // 3. Handle errors with toast notifications
    }

    // Save API Key
    handleSave(provider: string): Promise<void> {
        // 1. Validate API key input
        // 2. Encrypt and store key
        // 3. Update UI with masked key
        // 4. Show success/error notifications
    }

    // Input Handling
    handleInputChange(provider: string, value: string): void {
        // Update local state with new key value
    }
}
```

#### 3. Password Management
```typescript
// Password Operations
interface PasswordOperations {
    // Change Password
    handlePasswordChange(): Promise<void> {
        // 1. Validate new password
        // 2. Update password in Supabase
        // 3. Clear input field
        // 4. Show success/error notifications
    }
}
```

#### 4. Authentication Integration
```typescript
// Authentication Features
interface AuthFeatures {
    // Sign Out
    handleSignOut(): Promise<void> {
        // 1. Sign out from Supabase
        // 2. Clear user state
        // 3. Redirect to login
    }

    // Protected Route
    - Route protection with auth check
    - Loading state handling
    - Redirect to login if unauthorized
}
```

#### 5. UI Components
```typescript
// UI Elements
interface SettingsUI {
    // Layout
    - Responsive design
    - Loading states
    - Error handling
    - Success notifications

    // Styling
    - Custom fonts (Merriweather, DM Mono, Libre Franklin)
    - Consistent color scheme
    - Toast notifications for feedback
}
```

#### 6. Security Features
1. API keys are masked in the UI
2. Password validation before updates
3. Protected routes
4. Secure API key storage
5. Input sanitization
6. Error message handling

#### 7. State Management
```typescript
// State Variables
interface SettingsState {
    keys: APIKeys | undefined
    apiKeys: Record<string, string>
    isLoading: boolean
    isSaving: boolean
    user: User | null
}
```

#### 8. Error Handling
1. API key fetch errors
2. Save operation errors
3. Password change errors
4. Authentication errors
5. Network errors
6. Input validation errors