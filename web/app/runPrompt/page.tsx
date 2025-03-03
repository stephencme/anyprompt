// pages/test-run-prompt.tsx
"use client";
import { useRef, useState, FormEvent } from 'react';

const TestRunPromptPage: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent the default GET submission.
    setError('');
    setResult(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    // Get standalone variables.
    const userID = formData.get('userID') as string;
    const promptID = formData.get('promptID') as string;
    const provider = formData.get('provider') as string;
    const model = formData.get('model') as string;

    // Get the template parameters. These inputs have the same names so they form arrays.
    const keys = formData.getAll('templateKey') as string[];
    const values = formData.getAll('templateValue') as string[];

    const parameters: Record<string, string> = {};
    keys.forEach((key, i) => {
      if (key.trim() !== '') {
        parameters[key.trim()] = values[i] as string;
      }
    });

    // Basic validation.
    if (!userID || !promptID || !provider || !model) {
      setError('Please fill in all standalone fields (userID, promptID, provider, model).');
      return;
    }
    if (Object.keys(parameters).length === 0) {
      setError('Please provide at least one template parameter.');
      return;
    }

    try {
      // Ensure that the API endpoint URL matches your API route.
      const response = await fetch('/api/run-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID,
          promptID,
          provider,
          model,
          parameters, // Used for prompt template replacement.
        }),
      });

      // Read and parse the JSON response.
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'An error occurred.');
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Run Prompt API</h1>
      <form ref={formRef} onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <fieldset style={{ marginBottom: '1rem' }}>
          <legend>Standalone Variables</legend>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              User ID:
              <input type="text" name="userID" required style={{ marginLeft: '1rem' }} />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Prompt ID:
              <input type="text" name="promptID" required style={{ marginLeft: '1rem' }} />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Provider:
              <input type="text" name="provider" required style={{ marginLeft: '1rem' }} />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Model:
              <input type="text" name="model" required style={{ marginLeft: '1rem' }} />
            </label>
          </div>
        </fieldset>

        <fieldset style={{ marginBottom: '1rem' }}>
          <legend>Template Variables (for prompt replacement)</legend>
          <div style={{ marginBottom: '0.5rem' }}>
            <input type="text" name="templateKey" placeholder="Key" required style={{ marginRight: '0.5rem' }} />
            <input type="text" name="templateValue" placeholder="Value" required style={{ marginRight: '0.5rem' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <input type="text" name="templateKey" placeholder="Key" style={{ marginRight: '0.5rem' }} />
            <input type="text" name="templateValue" placeholder="Value" style={{ marginRight: '0.5rem' }} />
          </div>
          {/* Add more rows if needed */}
        </fieldset>

        <button type="submit">Run Prompt</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && (
        <div>
          <h2>Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestRunPromptPage;
