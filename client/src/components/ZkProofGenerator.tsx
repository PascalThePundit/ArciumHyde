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
      setError('Age cannot be empty.');
      setLoading(false);
      return;
    }

    const age = parseFloat(inputData);
    if (isNaN(age)) {
      setError('Please enter a valid age.');
      setLoading(false);
      return;
    }

    try {
      // Generate an age verification proof - check if age is above 18
      const generatedProof = await generateZKProof({ 
        value: age,
        description: `Age verification: ${age} years old, proving over 18`
      });
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
      <h2 className="text-2xl font-bold text-white mb-4">Age Verification</h2>
      <p className="text-gray-300 mb-4">Prove you're over 18 without revealing your exact age.</p>
      <div className="mb-4">
        <label htmlFor="inputData" className="block text-gray-400 text-sm font-bold mb-2">
          Your Age:
        </label>
        <input
          type="number"
          id="inputData"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="e.g., 25"
          disabled={loading}
        />
      </div>
      <Button onClick={handleGenerateProof} disabled={loading}>
        {loading ? 'Generating Age Proof...' : 'Verify Age Privately'}
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
