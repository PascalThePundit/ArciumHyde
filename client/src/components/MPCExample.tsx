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
      <h2 className="text-2xl font-bold text-white mb-4">MPC Example</h2>
      <p className="text-gray-300 mb-4">Perform secure multi-party computation.</p>
      <div className="mb-4">
        <label htmlFor="inputValues" className="block text-gray-400 text-sm font-bold mb-2">
          Comma-separated Inputs (e.g., 10,20,30):
        </label>
        <input
          type="text"
          id="inputValues"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={inputValues}
          onChange={(e) => setInputValues(e.target.value)}
          placeholder="e.g., 10,20,30"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="operation" className="block text-gray-400 text-sm font-bold mb-2">
          Operation:
        </label>
        <select
          id="operation"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700"
          value={operation}
          onChange={(e) => setOperation(e.target.value as 'add' | 'multiply')}
          disabled={loading}
        >
          <option value="add">Addition</option>
          <option value="multiply">Multiplication</option>
        </select>
      </div>
      <Button onClick={handlePerformMPC} disabled={loading}>
        {loading ? 'Performing MPC...' : 'Perform MPC'}
      </Button>
      {result !== null && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 text-sm break-all">
          <p className="text-gray-400">MPC Result:</p>
          <p className="text-primary-purple text-lg font-bold">{result}</p>
        </div>
      )}
    </Card>
  );
};

export default MPCExample;
