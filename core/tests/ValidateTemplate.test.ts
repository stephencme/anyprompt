// ValidateTemplate.test.ts
import { validateTemplate } from '../AnyPromptCore';

describe('validateTemplate', () => {
  it('should return true for valid template 1', () => {
    expect(validateTemplate("I’m a {{ template }}")).toBe(true);
  });

  it('should return true for valid template 2', () => {
    expect(validateTemplate("{{temp_lates  }} are cool!!!")).toBe(true);
  });

  it('should return true for valid template 3', () => {
    expect(validateTemplate("Please summarize the following email {{ EMAIL }} and highlight info related to {{ USER_1  }}")).toBe(true);
  });

  it('should return false for invalid template 1', () => {
    expect(validateTemplate("Bears hibernate in {{season")).toBe(false);
  });

  it('should return false for invalid template 2', () => {
    expect(validateTemplate("Tea is {{user sentiment}} than coffee")).toBe(false);
  });

  it('should return false for invalid template 3', () => {
    expect(validateTemplate("Summarize {{ {{userEMAIL }} }} ")).toBe(false);
  });

  it('should return false for invalid template 4', () => {
    expect(validateTemplate("Translate {{ {{userEMAIL }} ")).toBe(false);
  });
});