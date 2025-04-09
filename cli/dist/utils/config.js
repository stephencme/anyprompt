"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function getConfig() {
    const configPath = path_1.default.join(process.cwd(), '.anypromptrc');
    try {
        const configContent = await fs_1.promises.readFile(configPath, 'utf-8');
        return JSON.parse(configContent);
    }
    catch (error) {
        throw new Error('No .anypromptrc file found. Please run anyprompt init first.');
    }
}
