# Project Local Setup Documentation

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)

## Introduction

- **Purpose:**  
    The goal of this documentation is to document the local setup of the AnyPrompt project on the local machine and to document any potential issues during setup and corresponding solutions.

- **Audience:**  
    This document is intended for any new developers and contributors to the AnyPrompt project.

## Prerequisites

- **Git:**  
    Ensure that Git is installed on your machine. For installation help, visit [Git Downloads Page](https://git-scm.com/downloads).

- **Node.js & npm:**  
    Node.js and npm is required to manage project dependencies and run the project. For installation details, see the [Node.js Download Page](https://nodejs.org/en/download/).

## Installation

### Step 1: Clone the project repository

``` bash
git clone https://github.com/stephencme/anyprompt.git
cd anyprompt
```

### Step 2: Install dependencies
  
```bash
# Make sure you are in the /anyprompt project root
npm install
```

## Running the Project

### Running the Web App

```bash
cd web

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**IMPORTANT NOTE:** Currently the only page that is created is `prompts` so direcly accessing [http://localhost:3000](http://localhost:3000) will cause a $404$ error. For successful access please open [http://localhost:3000/prompts](http://localhost:3000/prompts) instead.

## Troubleshooting

### Issue 1: VSCode error

``` tsx
import { PromptTemplate, promptNameAndVersion } from "@anyprompt/core"
```

If trying to use the `core` functions similar to the above and is giving an error of `Cannot find module '@anyprompt/core' or its corresponding type declarations.` in VSCode, then there might have been an issue where npm was unable to symlink the core (not very likely but can happen). To manually ensure that the symlink is correctly established, please do the following:

``` bash
cd anyprompt/core

npm install
```

This should fix the problem and VSCode should no longer display an error.

### Issue 2: Supabase URL not found

The project does not include a centralized Supabase project for individual usage, so when accessing [http://localhost:3000/prompts](http://localhost:3000/prompts) the following error can be seen:

```Bash
Server Error
    Error: supabaseUrl is required.
```

To resolve the issue please visit [database.new](https://database.new/) and follow the instructions to create a new self-hosted Supabase project. Once a project is created please create a file named `.env.local` under the `anyprompt/web` folder. Then add the `SUPABASE_URL` and `SUPABASE_ANON_KEY` of the newly created Supabase project to the `.env.local` file.

Example of `.env.local` content:

```shell
SUPABASE_URL=https://SOMETHING.supabase.co
SUPABASE_ANON_KEY=eyJhbGXVCJ9.eyJpcIA1NDQ4MDM1N30.igQTnwq1EI
```

The issue should then be solved.
