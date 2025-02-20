// AnyPromptCore.test.ts
import {
    AnyPromptCore,
    promptNameAndVersion,
    validateTemplate,
    PromptTemplate,
  } from '../AnyPromptCore';

  describe('AnyPromptCore class', () => {
    let core: AnyPromptCore;
  
    beforeEach(() => {
      core = new AnyPromptCore();
    });
  
    it('should set correctly', () => {
      const key = 'test@v1';
      const template = 'Testing, {{name}}!';
      core.setPrompt(key, template);
      
      const prompt = core.getPrompt(key);
      expect(prompt.id).toBe(key);
      expect(prompt.name).toBe('test');
      expect(prompt.version).toBe('v1');
      expect(prompt.template).toBe(template);
    });
  
    it('should throw an error when setting a prompt with an invalid template', () => {
      const key = 'invalid@v1';
      const badTemplate = 'This is {{invalid';
      expect(() => core.setPrompt(key, badTemplate)).toThrowError();
    });
  
    it('should set multiple prompts via setPrompts', () => {
      const prompts = {
        'test1@v1': { id: 'test1@v1', name: 'test1', version: 'v1', template: 'Testing {{ item }} now!' },
        'test2@v1': { id: 'test2@v1', name: 'test2', version: 'v1', template: 'Username is{{user_name  }}' },
      };
      core.setPrompts(prompts);
  
      const promo = core.getPrompt('test1@v1');
      expect(promo.template).toBe('Testing {{ item }} now!');
  
      const offer = core.getPrompt('test2@v1');
      expect(offer.template).toBe('Username is{{user_name  }}');
    });
  
    it('should throw an error in setPrompts if one of the templates is invalid', () => {
      const prompts = {
        'test@v1': { id: 'test@v1', name: 'good', version: 'v1', template: 'This is a good one {{name}}' },
        // Invalid because "bad variable" is not a valid JS identifier.
        'bad@v1': { id: 'bad@v1', name: 'bad', version: 'v1', template: 'This is a bad one {{ bad variable }}' },
      };
  
      expect(() => core.setPrompts(prompts)).toThrowError();
    });
  });