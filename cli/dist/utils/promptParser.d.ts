interface ParsedPrompt {
    title: string;
    description: string;
    prompt: string;
    examples: string[];
}
export declare function parsePromptFile(content: string): ParsedPrompt;
export {};
