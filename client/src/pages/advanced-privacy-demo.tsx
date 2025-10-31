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
      
      let operationDescription = '';
      switch (operation) {
        case 'add':
          resultValue = inputNum + 20; // Add risk threshold
          operationDescription = 'Added risk threshold to health metric';
          break;
        case 'multiply':
          resultValue = inputNum * 0.8; // Risk factor
          operationDescription = 'Applied risk factor to health metric';
          break;
        case 'square':
          resultValue = inputNum * inputNum; // Risk index calculation
          operationDescription = 'Calculated risk index from health metric';
          break;
        default:
          resultValue = inputNum;
          operationDescription = 'No operation performed';
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
            <h2 className="text-2xl font-bold text-white mb-4">Secure Medical Research</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Analyze sensitive patient data across multiple hospitals without exposing individual records. 
              Computations performed on encrypted data maintain privacy while enabling valuable research insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Patient Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Health Metric (e.g., Blood Pressure):</label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="e.g., 120"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Research Operation:</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  >
                    <option value="add">Add Risk Threshold (20)</option>
                    <option value="multiply">Multiply by Risk Factor (0.8)</option>
                    <option value="square">Calculate Risk Index</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleHomomorphicOperation} 
                  disabled={isLoading || !inputValue}
                  className="w-full"
                >
                  {isLoading ? 'Computing on Encrypted Medical Data...' : 'Perform Secure Analysis'}
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Analysis Process</h3>
              <div className="space-y-6">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Patient Data</h4>
                  <p className="text-2xl font-bold text-white">
                    {originalData ? originalData : '?'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Dr. Jekyll (Private record)</p>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Encrypted Record</h4>
                  <p className="text-xl font-mono text-gray-300 break-all">
                    {encryptedData || 'Encrypted data appears here...'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Mr. Hyde (Encrypted form)</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-primary-purple/20 to-transparent rounded-lg border border-primary-purple/50">
                  <h4 className="text-lg font-medium text-primary-purple mb-2">Research Result</h4>
                  <p className="text-2xl font-bold text-white">
                    {result || '?'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Computed without revealing patient data</p>
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
            <h3 className="text-xl font-semibold text-white mb-4">About Secure Medical Research</h3>
            <p className="text-gray-300 mb-4">
              Just as Dr. Jekyll transforms into Mr. Hyde while remaining fundamentally the same person,
              patient data can exist in encrypted form while maintaining its mathematical properties.
              This allows researchers to analyze sensitive medical data, producing results that advance 
              medical knowledge without compromising patient privacy.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdvancedPrivacyDemoPage;
