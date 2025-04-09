import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { watch } from 'chokidar';
import { debounce } from 'lodash';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function sync(devMode: boolean = false): Promise<void> {
  const spinner = ora('Syncing prompts...').start();

  try {
    // Check if .anypromptrc exists
    const configPath = path.join(process.cwd(), '.anypromptrc');
    if (!fs.existsSync(configPath)) {
      spinner.fail(chalk.red('No .anypromptrc file found. Please run anyprompt init first.'));
      process.exit(1);
    }

    // Read config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const promptsDir = path.join(process.cwd(), config.promptsDir || '.anyprompt');

    // Ensure prompts directory exists
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Check if auth session exists in config
    if (!config.auth?.session) {
      spinner.fail(chalk.red('No auth session found. Please run anyprompt login first.'));
      process.exit(1);
    }

    // Set the session
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: config.auth.session.access_token,
      refresh_token: config.auth.session.refresh_token,
    });

    if (setSessionError) {
      spinner.fail(chalk.red('Session expired. Please run anyprompt login again.'));
      process.exit(1);
    }

    // Verify the session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      spinner.fail(chalk.red('Session invalid. Please run anyprompt login again.'));
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
        const promptsWithVersions = await Promise.all(
          prompts.map(async (prompt) => {
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
          })
        );

        // Write prompts to files
        for (const prompt of promptsWithVersions) {
          const promptDir = path.join(promptsDir, prompt.name);
          if (!fs.existsSync(promptDir)) {
            fs.mkdirSync(promptDir, { recursive: true });
          }

          // Write prompt metadata
          fs.writeFileSync(
            path.join(promptDir, 'metadata.json'),
            JSON.stringify({
              id: prompt.id,
              name: prompt.name,
              description: prompt.description,
              created_at: prompt.created_at,
              updated_at: prompt.updated_at,
            }, null, 2)
          );

          // Write each version
          for (const version of prompt.versions) {
            const versionFile = path.join(promptDir, `${version.version}.json`);
            fs.writeFileSync(
              versionFile,
              JSON.stringify({
                version: version.version,
                prompt: version.prompt,
                template_variables: version.template_variables,
              }, null, 2)
            );
          }
        }

        spinner.succeed(chalk.green('Successfully synced prompts'));
        
        if (!devMode) {
          process.exit(0);
        }
      } catch (error) {
        spinner.fail(chalk.red(`Error syncing prompts: ${error instanceof Error ? error.message : 'Unknown error'}`));
        if (!devMode) {
          process.exit(1);
        }
      }
    };

    // Initial sync
    await fetchAndWritePrompts();

    // If in dev mode, watch for changes
    if (devMode) {
      console.log(chalk.blue('\nLive Refresh Mode enabled. Press Ctrl+C to exit.'));
      
      // Watch for changes in the prompts directory
      const watcher = watch(promptsDir, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
      });

      // Debounced sync function to prevent multiple rapid syncs
      const debouncedSync = debounce(async () => {
        console.log(chalk.blue('Local changes detected, syncing with server...'));
        await fetchAndWritePrompts();
      }, 1000);

      // Watch for changes
      watcher
        .on('add', debouncedSync)
        .on('change', debouncedSync)
        .on('unlink', debouncedSync)
        .on('error', error => {
          console.error(chalk.red('Error watching files:'), error);
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
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
} 