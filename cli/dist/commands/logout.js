"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = logout;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function logout() {
    const spinner = (0, ora_1.default)('Logging out...').start();
    try {
        // Check if .anypromptrc exists
        const configPath = path_1.default.join(process.cwd(), '.anypromptrc');
        if (!fs_1.default.existsSync(configPath)) {
            spinner.fail(chalk_1.default.red('No .anypromptrc file found. Please run anyprompt init first.'));
            process.exit(1);
        }
        // Read config
        const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        // Check if auth session exists
        if (!config.auth?.session) {
            spinner.fail(chalk_1.default.red('No active session found. You are already logged out.'));
            process.exit(1);
        }
        // Remove auth session
        delete config.auth;
        // Write updated config
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
        spinner.succeed(chalk_1.default.green('Successfully logged out'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
    }
}
