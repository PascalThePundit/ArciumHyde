import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { generateBalanceThresholdProof } from '../services/zkProofService';

const BalanceThresholdProof: React.FC = () => {
  const [balance, setBalance] = useState<string>('');
  const [threshold, setThreshold] = useState<string>('');
  const [proof, setProof] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateProof = async () => {
    setLoading(true);
    setProof(null);
    try {
      const numBalance = parseFloat(balance);
      const numThreshold = parseFloat(threshold);

      if (isNaN(numBalance) || isNaN(numThreshold)) {
        setProof('Please enter valid numbers for balance and threshold.');
        return;
      }

      const generatedProof = await generateBalanceThresholdProof(numBalance, numThreshold);
      setProof(generatedProof);
    } catch (error) {
      console.error('Error generating balance threshold proof:', error);
      setProof('Error generating proof.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Balance Threshold Proof</h2>
      <p className="text-gray-300 mb-4">Prove your balance is above a threshold without revealing the exact amount.</p>
      <div className="mb-4">
        <label htmlFor="balance" className="block text-gray-400 text-sm font-bold mb-2">
          Your Balance:
        </label>
        <input
          type="number"
          id="balance"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="e.g., 1000"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="threshold" className="block text-gray-400 text-sm font-bold mb-2">
          Threshold:
        </label>
        <input
          type="number"
          id="threshold"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="e.g., 500"
          disabled={loading}
        />
      </div>
      <Button onClick={handleGenerateProof} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Threshold Proof'}
      </Button>
      {proof && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 text-sm break-all">
          <p className="text-gray-400">Generated Proof:</p>
          <p className="text-primary-purple">{proof}</p>
        </div>
      )}
    </Card>
  );
};

export default BalanceThresholdProof;
