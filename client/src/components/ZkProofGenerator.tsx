import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { generateZKProof } from '../services/zkProofService';

const ZkProofGenerator: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [proof, setProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateProof = async () => {
    setLoading(true);
    setProof(null);
    setError(null);
    setError(null);
    if (!inputData.trim()) {
      setError('Input data cannot be empty.');
      setLoading(false);
      return;
    }

    if (isNaN(Number(inputData))) {
      setError('Input data must be a valid number.');
      setLoading(false);
      return;
    }

    try {
      // In a real app, inputData would be parsed and validated
      const generatedProof = await generateZKProof({ value: inputData });
      setProof(generatedProof);
    } catch (err: any) {
      console.error('Error generating ZK proof:', err);
      setError(err.message || 'Error generating proof.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-4">ZK Proof Generator</h2>
      <p className="text-gray-300 mb-4">Generate a zero-knowledge proof for your private data.</p>
      <div className="mb-4">
        <label htmlFor="inputData" className="block text-gray-400 text-sm font-bold mb-2">
          Private Input Data:
        </label>
        <input
          type="text"
          id="inputData"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="e.g., 12345"
          disabled={loading}
        />
      </div>
      <Button onClick={handleGenerateProof} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Proof'}
      </Button>
      {error && (
        <div className="mt-4 p-3 bg-red-800 rounded border border-red-700 text-sm break-all text-white">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      {proof && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 text-sm break-all">
          <p className="text-gray-400">Generated Proof:</p>
          <p className="text-primary-purple">{proof}</p>
        </div>
      )}
    </Card>
  );
};

export default ZkProofGenerator;
