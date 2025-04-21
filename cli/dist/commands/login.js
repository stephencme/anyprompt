"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const supabase_js_1 = require("@supabase/supabase-js");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qcuruxudpkctlyrvagyy.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdXJ1eHVkcGtjdGx5cnZhZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MDQzNTcsImV4cCI6MjA1NDQ4MDM1N30.igQTnslj7wYbdy6BD8z3YZipLATdvQh1URO3-ewq1EI";
// Function to get user input
function question(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
// Function to get password input with masking
function passwordQuestion(query) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        // Disable terminal echo
        stdin.setRawMode(true);
        stdin.setEncoding('utf8');
        stdout.write(query);
        let password = '';
        const onData = (data) => {
            const char = data.toString();
            const charCode = char.charCodeAt(0);
            // Handle backspace
            if (charCode === 127 && password.length > 0) {
                password = password.slice(0, -1);
            }
            // Handle enter key
            else if (charCode === 13) {
                stdout.write('\n');
                cleanup();
                resolve(password);
            }
            // Handle Ctrl+C
            else if (charCode === 3) {
                stdout.write('\n');
                cleanup();
                process.exit(0);
            }
            // Handle regular characters
            else if (charCode >= 32 && charCode <= 126) {
                password += char;
            }
        };
        const cleanup = () => {
            stdin.removeListener('data', onData);
            stdin.setRawMode(false);
            stdin.pause();
        };
        stdin.resume();
        stdin.on('data', onData);
    });
}
async function login() {
    console.log('Starting login process...');
    const spinner = (0, ora_1.default)('Initializing login...').start();
    try {
        console.log('Creating Supabase client...');
        // Initialize Supabase client
        const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client created successfully');
        // Check if we can connect to Supabase
        console.log('Testing Supabase connection...');
        const { data: healthCheck, error: healthError } = await supabase.from('prompts').select('count').limit(1);
        if (healthError) {
            console.error('Supabase connection error:', healthError);
            throw new Error(`Failed to connect to Supabase: ${healthError.message}`);
        }
        console.log('Supabase connection successful');
        // Stop spinner before asking for input
        spinner.stop();
        // Get email and password
        console.log('Please enter your credentials:');
        const email = await question('Email: ');
        if (!email || !email.includes('@')) {
            throw new Error('Please enter a valid email');
        }
        const password = await passwordQuestion('Password: ');
        if (!password) {
            throw new Error('Password is required');
        }
        console.log('Credentials collected');
        // Restart spinner for login
        spinner.start('Logging in...');
        // Sign in with email and password
        console.log('Attempting to sign in...');
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Sign in error:', error);
            throw new Error(`Failed to log in: ${error.message}`);
        }
        if (!session) {
            console.error('No session received');
            throw new Error('No session received from Supabase');
        }
        console.log('Session received, saving to config...');
        // Save session to .anypromptrc
        const configPath = path_1.default.join(process.cwd(), '.anypromptrc');
        let config = {};
        try {
            const configContent = await fs_1.promises.readFile(configPath, 'utf8');
            config = JSON.parse(configContent);
            console.log('Existing config loaded');
        }
        catch (error) {
            console.log('No existing config found, creating new one');
            // If file doesn't exist or is invalid, we'll create a new one
        }
        // Store the complete session object
        config.auth = {
            session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at,
                expires_in: session.expires_in,
                token_type: 'bearer',
                user: session.user,
            },
        };
        await fs_1.promises.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log('Config saved successfully');
        spinner.succeed(chalk_1.default.green('Successfully logged in!'));
    }
    catch (error) {
        console.error('Login process failed:', error);
        spinner.fail(chalk_1.default.red(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
    }
}
