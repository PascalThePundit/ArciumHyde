import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { performMPCAddition, performMPCMultiplication } from '../services/mpcService';

const MPCExample: React.FC = () => {
  const [inputValues, setInputValues] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<'add' | 'multiply'>('add');

  const handlePerformMPC = async () => {
    setLoading(true);
    setResult(null);
    try {
      const inputs = inputValues.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

      if (inputs.length < 2) {
        setResult(0); // Or some error indicator
        return;
      }

      let mpcResult: number;
      if (operation === 'add') {
        mpcResult = await performMPCAddition(inputs);
      } else {
        mpcResult = await performMPCMultiplication(inputs);
      }
      setResult(mpcResult);
    } catch (error) {
      console.error('Error performing MPC:', error);
      setResult(0); // Or some error indicator
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Private Income Verification</h2>
      <p className="text-gray-300 mb-4">Verify income eligibility without revealing exact salaries.</p>
      <div className="mb-4">
        <label htmlFor="inputValues" className="block text-gray-400 text-sm font-bold mb-2">
          Monthly Incomes ($): Comma-separated (e.g., 4000,5000,6000):
        </label>
        <input
          type="text"
          id="inputValues"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={inputValues}
          onChange={(e) => setInputValues(e.target.value)}
          placeholder="e.g., 4000,5000,6000"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="operation" className="block text-gray-400 text-sm font-bold mb-2">
          Verification Type:
        </label>
        <select
          id="operation"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={operation}
          onChange={(e) => setOperation(e.target.value as 'add' | 'multiply')}
          disabled={loading}
        >
          <option value="add">Calculate Average Income</option>
          <option value="multiply">Apply Risk Multiplier</option>
        </select>
      </div>
      <Button onClick={handlePerformMPC} disabled={loading}>
        {loading ? 'Verifying Incomes Privately...' : 'Verify Income Securely'}
      </Button>
      {result !== null && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 text-sm break-all">
          <p className="text-gray-400">Verification Result:</p>
          <p className="text-primary-purple text-lg font-bold">{result}</p>
        </div>
      )}
    </Card>
  );
};

export default MPCExample;
