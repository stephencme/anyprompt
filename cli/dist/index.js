#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
        return;
    }
    console.warn(warning.name, warning.message);
});
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const sync_1 = require("./commands/sync");
const login_1 = require("./commands/login");
const logout_1 = require("./commands/logout");
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .name('anyprompt')
    .description('CLI tool for AnyPrompt - Manage your prompts with ease')
    .version('0.1.0');
program
    .command('init')
    .description('Initialize AnyPrompt in your project')
    .action(async () => {
    try {
        await (0, init_1.init)();
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
    }
});
program
    .command('login')
    .description('Log in to AnyPrompt using GitHub')
    .action(async () => {
    try {
        await (0, login_1.login)();
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
    }
});
program
    .command('logout')
    .description('Log out from AnyPrompt')
    .action(async () => {
    try {
        await (0, logout_1.logout)();
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
    }
});
program
    .command('sync')
    .description('Sync prompts from the server')
    .option('-dev, --dev', 'Enable Live Refresh Mode for development')
    .action(async (options) => {
    try {
        await (0, sync_1.sync)(options.dev);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'An unknown error occurred');
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
