"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = sync;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const supabase_js_1 = require("@supabase/supabase-js");
const chokidar_1 = require("chokidar");
const lodash_1 = require("lodash");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qcuruxudpkctlyrvagyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdXJ1eHVkcGtjdGx5cnZhZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MDQzNTcsImV4cCI6MjA1NDQ4MDM1N30.igQTnslj7wYbdy6BD8z3YZipLATdvQh1URO3-ewq1EI';
async function sync(devMode = false) {
    const spinner = (0, ora_1.default)('Syncing prompts...').start();
    try {
        // Check if .anypromptrc exists
        const configPath = path_1.default.join(process.cwd(), '.anypromptrc');
        if (!fs_1.default.existsSync(configPath)) {
            spinner.fail(chalk_1.default.red('No .anypromptrc file found. Please run anyprompt init first.'));
            process.exit(1);
        }
        // Read config
        const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        const promptsDir = path_1.default.join(process.cwd(), config.promptsDir || '.anyprompt');
        // Ensure prompts directory exists
        if (!fs_1.default.existsSync(promptsDir)) {
            fs_1.default.mkdirSync(promptsDir, { recursive: true });
        }
        // Initialize Supabase client
        const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Check if auth session exists in config
        if (!config.auth?.session) {
            spinner.fail(chalk_1.default.red('No auth session found. Please run anyprompt login first.'));
            process.exit(1);
        }
        // Set the session
        const { error: setSessionError } = await supabase.auth.setSession({
            access_token: config.auth.session.access_token,
            refresh_token: config.auth.session.refresh_token,
        });
        if (setSessionError) {
            spinner.fail(chalk_1.default.red('Session expired. Please run anyprompt login again.'));
            process.exit(1);
        }
        // Verify the session is valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            spinner.fail(chalk_1.default.red('Session invalid. Please run anyprompt login again.'));
            process.exit(1);
        }
        // Function to fetch and write prompts
        const fetchAndWritePrompts = async () => {
            try {
                // Fetch all prompts
                const { data: prompts, error: promptsError } = await supabase
                    .from('prompts')
                    .select('*');
                if (promptsError) {
                    throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
                }
                // Fetch versions for each prompt
                const promptsWithVersions = await Promise.all(prompts.map(async (prompt) => {
                    const { data: versions, error: versionsError } = await supabase
                        .from('prompt_version')
                        .select('version, prompt, template_variables')
                        .eq('prompt_id', prompt.id)
                        .order('created_at', { ascending: false });
                    if (versionsError) {
                        throw new Error(`Failed to fetch versions for prompt ${prompt.id}: ${versionsError.message}`);
                    }
                    return {
                        ...prompt,
                        versions: versions.map((v) => ({
                            version: v.version,
                            prompt: v.prompt,
                            template_variables: v.template_variables,
                        })),
                    };
                }));
                // Write prompts to files
                for (const prompt of promptsWithVersions) {
                    const promptDir = path_1.default.join(promptsDir, prompt.name);
                    if (!fs_1.default.existsSync(promptDir)) {
                        fs_1.default.mkdirSync(promptDir, { recursive: true });
                    }
                    // Write prompt metadata
                    fs_1.default.writeFileSync(path_1.default.join(promptDir, 'metadata.json'), JSON.stringify({
                        id: prompt.id,
                        name: prompt.name,
                        description: prompt.description,
                        created_at: prompt.created_at,
                        updated_at: prompt.updated_at,
                    }, null, 2));
                    // Write each version
                    for (const version of prompt.versions) {
                        const versionFile = path_1.default.join(promptDir, `${version.version}.json`);
                        fs_1.default.writeFileSync(versionFile, JSON.stringify({
                            version: version.version,
                            prompt: version.prompt,
                            template_variables: version.template_variables,
                        }, null, 2));
                    }
                }
                spinner.succeed(chalk_1.default.green('Successfully synced prompts'));
                if (!devMode) {
                    process.exit(0);
                }
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Error syncing prompts: ${error instanceof Error ? error.message : 'Unknown error'}`));
                if (!devMode) {
                    process.exit(1);
                }
            }
        };
        // Initial sync
        await fetchAndWritePrompts();
        // If in dev mode, watch for changes
        if (devMode) {
            console.log(chalk_1.default.blue('\nLive Refresh Mode enabled. Press Ctrl+C to exit.'));
            // Watch for changes in the prompts directory
            const watcher = (0, chokidar_1.watch)(promptsDir, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true
            });
            // Debounced sync function to prevent multiple rapid syncs
            const debouncedSync = (0, lodash_1.debounce)(async () => {
                console.log(chalk_1.default.blue('Local changes detected, syncing with server...'));
                await fetchAndWritePrompts();
            }, 1000);
            // Watch for changes
            watcher
                .on('add', debouncedSync)
                .on('change', debouncedSync)
                .on('unlink', debouncedSync)
                .on('error', error => {
                console.error(chalk_1.default.red('Error watching files:'), error);
            });
            // Handle process termination
            const cleanup = () => {
                watcher.close();
                process.exit(0);
            };
            // Keep the process running in dev mode
            process.on('SIGINT', cleanup);
            process.on('SIGTERM', cleanup);
            process.on('SIGQUIT', cleanup);
            // Prevent the process from exiting
            process.stdin.resume();
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
    }
}
