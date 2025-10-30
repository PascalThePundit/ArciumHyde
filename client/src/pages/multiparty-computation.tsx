import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const MultiPartyComputationPage: React.FC = () => {
  const [party1Value, setParty1Value] = useState('');
  const [party2Value, setParty2Value] = useState('');
  const [party3Value, setParty3Value] = useState('');
  const [operation, setOperation] = useState('avg');
  const [result, setResult] = useState<string | null>(null);
  const [computationLog, setComputationLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMPCOperation = async () => {
    setIsLoading(true);
    setResult(null);
    setComputationLog([]);
    
    // Simulate MPC process
    setTimeout(() => {
      const val1 = parseFloat(party1Value) || 0;
      const val2 = parseFloat(party2Value) || 0;
      const val3 = parseFloat(party3Value) || 0;
      let resultValue: number;
      let operationName: string;
      
      switch (operation) {
        case 'avg':
          resultValue = (val1 + val2 + val3) / 3;
          operationName = 'Average';
          break;
        case 'sum':
          resultValue = val1 + val2 + val3;
          operationName = 'Sum';
          break;
        case 'median':
          const values = [val1, val2, val3].sort((a, b) => a - b);
          resultValue = values[1]; // median of 3 values
          operationName = 'Median';
          break;
        case 'min':
          resultValue = Math.min(val1, val2, val3);
          operationName = 'Minimum';
          break;
        default:
          resultValue = (val1 + val2 + val3) / 3;
          operationName = 'Average';
      }
      
      // Log the MPC process
      const log = [
        `Party A input: ${val1} (encrypted share)`,
        `Party B input: ${val2} (encrypted share)`,
        `Party C input: ${val3} (encrypted share)`,
        `Secure ${operationName.toLowerCase()} computation initiated`,
        `MPC protocol executed across all parties`,
        `Result computed without revealing individual inputs`,
      ];
      
      setComputationLog(log);
      setResult(resultValue.toString());
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Layout>
      <Header />
      <div className="min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-white font-bold">ARCI</span>
              <span className="text-primary-purple font-extrabold">U</span>
              <span className="text-white font-bold">M</span>
              <span className="text-primary-purple font-extrabold">HYDE</span>
            </h1>
            <h2 className="text-2xl font-bold text-white mb-4">Multi-Party Computation</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Collaboratively compute functions over private inputs while keeping those inputs secret. 
              Each party contributes to the computation without revealing their private data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4">MPC Participants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-primary-purple/30">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple flex items-center justify-center mr-2">
                      <span className="text-white text-sm">A</span>
                    </div>
                    <h4 className="text-lg font-medium text-white">Party A</h4>
                  </div>
                  <label className="block text-gray-400 text-sm mb-2">Private Input:</label>
                  <input
                    type="number"
                    value={party1Value}
                    onChange={(e) => setParty1Value(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple text-sm"
                    placeholder="Value"
                  />
                </div>
                
                <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-accent-purple/30">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center mr-2">
                      <span className="text-white text-sm">B</span>
                    </div>
                    <h4 className="text-lg font-medium text-white">Party B</h4>
                  </div>
                  <label className="block text-gray-400 text-sm mb-2">Private Input:</label>
                  <input
                    type="number"
                    value={party2Value}
                    onChange={(e) => setParty2Value(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-purple text-sm"
                    placeholder="Value"
                  />
                </div>
                
                <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-primary-purple/50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple/80 flex items-center justify-center mr-2">
                      <span className="text-white text-sm">C</span>
                    </div>
                    <h4 className="text-lg font-medium text-white">Party C</h4>
                  </div>
                  <label className="block text-gray-400 text-sm mb-2">Private Input:</label>
                  <input
                    type="number"
                    value={party3Value}
                    onChange={(e) => setParty3Value(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple/50 text-sm"
                    placeholder="Value"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-400 text-sm mb-2">Computation:</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                >
                  <option value="avg">Average ((A + B + C) / 3)</option>
                  <option value="sum">Sum (A + B + C)</option>
                  <option value="median">Median of 3 values</option>
                  <option value="min">Minimum (Min of A, B, C)</option>
                </select>
              </div>
              
              <Button 
                onClick={handleMPCOperation} 
                disabled={isLoading || !party1Value || !party2Value || !party3Value}
                className="w-full mt-6"
              >
                {isLoading ? 'Initiating MPC Protocol...' : 'Start Secure Computation'}
              </Button>
            </Card>

            <Card className="flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4">MPC Process</h3>
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {computationLog.map((log, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                      <span className="text-primary-purple">→</span> {log}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-xs p-2 bg-gray-800 rounded">
                      <span className="text-primary-purple">→</span> MPC protocol executing securely...
                    </div>
                  )}
                  {result && !isLoading && (
                    <div className="text-xs p-2 bg-gradient-to-r from-primary-purple/20 to-transparent rounded border border-primary-purple/30">
                      <span className="text-primary-purple">→</span> <strong>Result: {result}</strong>
                    </div>
                  )}
                </div>
                
                {result && !isLoading && (
                  <div className="p-4 bg-gradient-to-r from-primary-purple/10 to-accent-purple/10 rounded-lg border border-primary-purple/30 text-center">
                    <h4 className="text-lg font-semibold text-white mb-1">Secure Result</h4>
                    <p className="text-2xl font-bold text-primary-purple">{result}</p>
                    <p className="text-gray-400 text-sm mt-1">Computed without revealing inputs</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Collaborative</h3>
              <p className="text-gray-400 text-sm">Multiple parties work together without revealing their private data</p>
            </Card>
            
            <Card className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Private</h3>
              <p className="text-gray-400 text-sm">Inputs remain encrypted and never exposed to other parties</p>
            </Card>
            
            <Card className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">Accurate</h3>
              <p className="text-gray-400 text-sm">Result is mathematically equivalent to computation on plain text</p>
            </Card>
          </div>

          <Card className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">About Multi-Party Computation</h3>
            <p className="text-gray-300 text-sm mb-2">
              Multi-Party Computation (MPC) enables multiple parties to jointly compute a function 
              over their inputs while keeping those inputs private.
            </p>
            <p className="text-gray-300 text-sm">
              The ARCIUM HYDE MPC protocol allows collaborative analytics while preserving individual privacy,
              enabling computation on sensitive data without exposing it to other parties.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MultiPartyComputationPage;