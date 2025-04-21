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

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Link the CLI globally
npm link

# Now you can use the CLI
anyprompt init
``` 