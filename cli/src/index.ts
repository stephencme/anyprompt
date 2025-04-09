#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init';
import { sync } from './commands/sync';
import { login } from './commands/login';
import { logout } from './commands/logout';
import chalk from 'chalk';

const program = new Command();

program
  .name('anyprompt')
  .description('CLI tool for AnyPrompt - Manage your prompts with ease')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize AnyPrompt in your project')
  .action(async () => {
    try {
      await init();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

program
  .command('login')
  .description('Log in to AnyPrompt using GitHub')
  .action(async () => {
    try {
      await login();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Log out from AnyPrompt')
  .action(async () => {
    try {
      await logout();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Sync prompts from the server')
  .option('-dev', 'Enable Live Refresh Mode for development')
  .action(async (options) => {
    try {
      await sync(options.dev);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

// Add examples to the help text
program.addHelpText('after', `
Examples:
  $ anyprompt init
  $ anyprompt login
  $ anyprompt sync
  $ anyprompt sync -dev
  $ anyprompt logout
`);

program.parse(); 