# AnyPrompt CLI

Command-line interface for AnyPrompt.

## Installation

```bash
npm install -g @anyprompt/cli
```

## Usage

### Initialize AnyPrompt in your project

```bash
anyprompt init
```

This will:
- Create a `.anyprompt` directory
- Create a `.anypromptrc` configuration file
- Update `.gitignore` to exclude the `.anyprompt` directory

### Development

To work on the CLI locally:

- Copy the .env file from the web directory
- Paste it in the cli directory

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Link the CLI globally
npm link

#Fix Permission Issues
chmod +x dist/index.js

# Now you can use the CLI
anyprompt init
``` 

Next steps:
1. Run anyprompt login to authenticate with AnyPrompt
2. Run anyprompt sync to fetch your prompts
3. Run anyprompt sync -dev to watch for changes with live refresh mode
4. Run anyprompt logout to end the session