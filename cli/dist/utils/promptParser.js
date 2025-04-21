"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePromptFile = parsePromptFile;
function parsePromptFile(content) {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    let prompt = '';
    let examples = [];
    let currentSection = '';
    for (const line of lines) {
        if (line.startsWith('# ')) {
            title = line.replace('# ', '').trim();
        }
        else if (line.startsWith('## Description')) {
            currentSection = 'description';
        }
        else if (line.startsWith('## Prompt')) {
            currentSection = 'prompt';
        }
        else if (line.startsWith('## Examples')) {
            currentSection = 'examples';
        }
        else if (line.trim() && !line.startsWith('##')) {
            switch (currentSection) {
                case 'description':
                    description += line.trim() + ' ';
                    break;
                case 'prompt':
                    prompt += line + '\n';
                    break;
                case 'examples':
                    if (line.match(/^\d+\./)) {
                        examples.push(line.trim());
                    }
                    break;
            }
        }
    }
    return {
        title,
        description: description.trim(),
        prompt: prompt.trim(),
        examples
    };
}
