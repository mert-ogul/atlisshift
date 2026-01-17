'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [plan, setPlan] = useState<unknown>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleGeneratePlan = async () => {
    if (files.length === 0) {
      alert('Please select files');
      return;
    }

    setStatus('loading');

    try {
      // Read files
      const fileData = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          return {
            path: file.name,
            content,
            language: file.name.endsWith('.ts') || file.name.endsWith('.tsx')
              ? 'typescript'
              : 'javascript',
          };
        }),
      );

      // Generate plan
      const response = await fetch(`${API_URL}/api/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: fileData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const planData = await response.json();
      setPlan(planData);
      setStatus('success');
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
  };

  const handleStartJob = async () => {
    if (files.length === 0) {
      alert('Please select files');
      return;
    }

    setStatus('loading');

    try {
      const fileData = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          return {
            path: file.name,
            content,
            language: file.name.endsWith('.ts') || file.name.endsWith('.tsx')
              ? 'typescript'
              : 'javascript',
          };
        }),
      );

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: fileData }),
      });

      if (!response.ok) {
        throw new Error('Failed to start job');
      }

      const jobData = await response.json();
      setJobId(jobData.id);
      setStatus('running');

      // Poll for updates
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`${API_URL}/api/jobs/${jobData.id}`);
        if (statusResponse.ok) {
          const jobStatus = await statusResponse.json();
          if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            setStatus(jobStatus.status);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>AtlasShift</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Upload Files</h2>
        <input
          type="file"
          multiple
          accept=".ts,.tsx,.js,.jsx"
          onChange={handleFileChange}
          style={{ marginTop: '1rem' }}
        />
        {files.length > 0 && (
          <p style={{ marginTop: '0.5rem', color: '#666' }}>
            {files.length} file(s) selected
          </p>
        )}
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleGeneratePlan}
          disabled={files.length === 0 || status === 'loading'}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: files.length === 0 || status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          Generate Plan
        </button>

        <button
          onClick={handleStartJob}
          disabled={files.length === 0 || status === 'loading'}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: files.length === 0 || status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          Start Migration
        </button>
      </div>

      {status === 'loading' && <p>Processing...</p>}
      {status === 'error' && <p style={{ color: 'red' }}>An error occurred</p>}
      {status === 'success' && plan && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Migration Plan</h2>
          <pre
            style={{
              backgroundColor: '#f0f0f0',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(plan, null, 2)}
          </pre>
        </div>
      )}

      {jobId && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Job Status</h2>
          <p>Job ID: {jobId}</p>
          <p>Status: {status}</p>
        </div>
      )}
    </main>
  );
}
