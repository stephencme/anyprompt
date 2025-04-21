import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function logout(): Promise<void> {
  const spinner = ora('Logging out...').start();

  try {
    // Check if .anypromptrc exists
    const configPath = path.join(process.cwd(), '.anypromptrc');
    if (!fs.existsSync(configPath)) {
      spinner.fail(chalk.red('No .anypromptrc file found. Please run anyprompt init first.'));
      process.exit(1);
    }

    // Read config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Check if auth session exists
    if (!config.auth?.session) {
      spinner.fail(chalk.red('No active session found. You are already logged out.'));
      process.exit(1);
    }

    // Remove auth session
    delete config.auth;
    
    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    spinner.succeed(chalk.green('Successfully logged out'));
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
} 