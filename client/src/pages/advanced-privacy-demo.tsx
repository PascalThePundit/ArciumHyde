import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const AdvancedPrivacyDemoPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<string | null>(null);
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleHomomorphicOperation = async () => {
    setIsLoading(true);
    setResult(null);
    setOriginalData(inputValue);
    
    // Simulate homomorphic encryption and computation
    setTimeout(() => {
      const inputNum = parseFloat(inputValue);
      let resultValue: number;
      
      switch (operation) {
        case 'add':
          resultValue = inputNum + 10; // Simulated homomorphic addition
          break;
        case 'multiply':
          resultValue = inputNum * 2; // Simulated homomorphic multiplication
          break;
        case 'square':
          resultValue = inputNum * inputNum; // Simulated homomorphic squaring
          break;
        default:
          resultValue = inputNum;
      }
      
      setEncryptedData(`Encrypted(${inputValue})`);
      setResult(resultValue.toString());
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <Header />
      <div className="min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-white font-bold">ARCI</span>
              <span className="text-primary-purple font-extrabold">U</span>
              <span className="text-white font-bold">M</span>
              <span className="text-primary-purple font-extrabold">HYDE</span>
            </h1>
            <h2 className="text-2xl font-bold text-white mb-4">Homomorphic Encryption Demo</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Perform computations on encrypted data without ever decrypting it - just like Dr. Jekyll and Mr. Hyde, 
              the data has two forms but maintains its core identity throughout transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Input Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Enter a number:</label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="e.g., 42"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Operation:</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  >
                    <option value="add">Add 10</option>
                    <option value="multiply">Multiply by 2</option>
                    <option value="square">Square the value</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleHomomorphicOperation} 
                  disabled={isLoading || !inputValue}
                  className="w-full"
                >
                  {isLoading ? 'Computing on Encrypted Data...' : 'Perform HYDE Transformation'}
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">HYDE Transformation Process</h3>
              <div className="space-y-6">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Original Data</h4>
                  <p className="text-2xl font-bold text-white">
                    {originalData ? originalData : '?'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Dr. Jekyll (Plain text)</p>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Encrypted Data</h4>
                  <p className="text-xl font-mono text-gray-300 break-all">
                    {encryptedData || 'Encrypted data appears here...'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Mr. Hyde (Encrypted form)</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-primary-purple/20 to-transparent rounded-lg border border-primary-purple/50">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Transformation Result</h4>
                  <p className="text-2xl font-bold text-white">
                    {result || '?'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Result of computation on encrypted data</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Processing</h3>
              <p className="text-gray-400">Data remains encrypted throughout the entire computation process</p>
            </Card>
            
            <Card className="text-center">
              <div className="text-4xl mb-3">🧮</div>
              <h3 className="text-xl font-semibold text-white mb-2">Homomorphic Operations</h3>
              <p className="text-gray-400">Mathematical operations on encrypted data produce encrypted results</p>
            </Card>
            
            <Card className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Safe Transformation</h3>
              <p className="text-gray-400">The data maintains its privacy while enabling computation</p>
            </Card>
          </div>

          <Card className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">About HYDE Transformations</h3>
            <p className="text-gray-300 mb-4">
              Just as Dr. Jekyll transforms into Mr. Hyde while remaining fundamentally the same person,
              your data transforms into an encrypted form while maintaining its mathematical properties.
              This allows computations to be performed on the encrypted data, producing results that can
              be decrypted to reveal the same answer as if the operations were performed on the original data.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdvancedPrivacyDemoPage;
