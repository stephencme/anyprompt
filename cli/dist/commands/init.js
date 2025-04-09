"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function init() {
    const spinner = (0, ora_1.default)('Initializing AnyPrompt...').start();
    try {
        // Create .anyprompt directory
        const anypromptDir = path_1.default.join(process.cwd(), '.anyprompt');
        if (!fs_1.default.existsSync(anypromptDir)) {
            fs_1.default.mkdirSync(anypromptDir);
            spinner.text = 'Created .anyprompt directory';
        }
        // Create .anypromptrc file
        const configPath = path_1.default.join(process.cwd(), '.anypromptrc');
        if (!fs_1.default.existsSync(configPath)) {
            const config = {
                version: '0.1.0',
                promptsDir: '.anyprompt'
            };
            fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
            spinner.text = 'Created .anypromptrc configuration file';
        }
        // Update .gitignore
        const gitignorePath = path_1.default.join(process.cwd(), '.gitignore');
        if (fs_1.default.existsSync(gitignorePath)) {
            const gitignoreContent = fs_1.default.readFileSync(gitignorePath, 'utf8');
            if (!gitignoreContent.includes('.anyprompt')) {
                fs_1.default.appendFileSync(gitignorePath, '\n.anyprompt/\n');
                spinner.text = 'Updated .gitignore file';
            }
        }
        else {
            fs_1.default.writeFileSync(gitignorePath, '.anyprompt/\n');
            spinner.text = 'Created .gitignore file';
        }
        spinner.succeed(chalk_1.default.green('AnyPrompt initialized successfully!'));
        console.log(chalk_1.default.blue('\nNext steps:'));
        console.log('1. Run', chalk_1.default.cyan('anyprompt login'), 'to authenticate with AnyPrompt');
        console.log('2. Run', chalk_1.default.cyan('anyprompt sync'), 'to fetch your prompts');
        console.log('3. Run', chalk_1.default.cyan('anyprompt sync -dev'), 'to start development mode with live refresh');
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to initialize AnyPrompt'));
        throw error;
    }
}
