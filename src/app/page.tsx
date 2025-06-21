'use client';

import React, { useState } from 'react';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [role, setRole] = useState('');
  const [fitScore, setFitScore] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const uploadResume = async () => {
    if (!file) return alert('Please upload a resume');
    if (!role) return alert('Please enter a role before uploading');

    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file:', file);

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setFileId(data.file_id);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload resume. Check backend connection.');
    }
  };

  const askQuestion = async () => {
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('query', query);

    try {
      const res = await fetch(`${backendUrl}/ask`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Query failed');

      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      console.error('Ask error:', err);
      alert('Failed to get answer. Try again later.');
    }
  };

  const checkFit = async () => {
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('job_description', role);

    try {
      const res = await fetch(`${backendUrl}/fit-score`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Fit score failed');

      const data = await res.json();
      setFitScore(data.score);
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Fit Score error:', err);
      alert('Failed to get fit score. Please check your backend.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 space-y-4">
      <h1 className="text-3xl font-bold mb-4">Upload and Chat with Your Resume</h1>

      {/* Step 1: Role Input */}
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Enter job role (e.g., Data Scientist)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      {/* Step 2: Upload Resume */}
      <input
        type="file"
        accept=".pdf"
        className="mt-2"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
          console.log('Selected file:', selectedFile);
        }}
      />
      <button
        onClick={uploadResume}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Upload Resume
      </button>

      {/* Step 3: Ask Question + Fit Score */}
      {fileId && (
        <>
          {/* Ask a question about resume */}
          <div className="mt-6">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Ask something about your resume..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={askQuestion}
              className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
            >
              Ask
            </button>
            <p className="mt-2 text-gray-700">Answer: {response}</p>
          </div>

          {/* Check Fit + Suggestions */}
          <div className="mt-6">
            <button
              onClick={checkFit}
              className="bg-purple-600 text-white px-4 py-2 mt-2 rounded"
            >
              Check Role Fit & Suggestions
            </button>
            <p className="mt-2 text-gray-700 font-semibold">Fit Score: {fitScore}</p>
            <p className="mt-2 text-gray-700 whitespace-pre-line">
              <strong>Suggestions to Improve Resume:</strong>
              <br />
              {suggestions}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
