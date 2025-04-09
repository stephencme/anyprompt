import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function init(): Promise<void> {
  const spinner = ora('Initializing AnyPrompt...').start();

  try {
    // Create .anyprompt directory
    const anypromptDir = path.join(process.cwd(), '.anyprompt');
    if (!fs.existsSync(anypromptDir)) {
      fs.mkdirSync(anypromptDir);
      spinner.text = 'Created .anyprompt directory';
    }

    // Create .anypromptrc file
    const configPath = path.join(process.cwd(), '.anypromptrc');
    if (!fs.existsSync(configPath)) {
      const config = {
        version: '0.1.0',
        promptsDir: '.anyprompt'
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      spinner.text = 'Created .anypromptrc configuration file';
    }

    // Update .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.anyprompt')) {
        fs.appendFileSync(gitignorePath, '\n.anyprompt/\n');
        spinner.text = 'Updated .gitignore file';
      }
    } else {
      fs.writeFileSync(gitignorePath, '.anyprompt/\n');
      spinner.text = 'Created .gitignore file';
    }

    spinner.succeed(chalk.green('AnyPrompt initialized successfully!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Run', chalk.cyan('anyprompt login'), 'to authenticate with AnyPrompt');
    console.log('2. Run', chalk.cyan('anyprompt sync'), 'to fetch your prompts');
    console.log('3. Run', chalk.cyan('anyprompt sync -dev'), 'to start development mode with live refresh');
  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize AnyPrompt'));
    throw error;
  }
} 