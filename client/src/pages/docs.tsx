import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

const DocumentationPage: React.FC = () => {
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
              <span className="text-primary-purple font-extrabold">HYDE</span> Documentation
            </h1>
            <p className="text-xl text-gray-300 mt-4">Comprehensive guide to the ARCIUM HYDE privacy platform</p>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">About ARCIUM HYDE</h2>
              <p className="text-gray-300 mb-6">
                ARCIUM HYDE is named after the famous "Dr. Jekyll and Mr. Hyde" story, 
                where the same person exists in two different states simultaneously. 
                This perfectly captures the essence of <strong className="text-primary-purple">Homomorphic Encryption (HYDE)</strong>, 
                where data can exist in two forms:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-gray-800 rounded-lg border border-primary-purple/30">
                  <h3 className="text-lg font-bold text-primary-purple mb-2">Dr. Jekyll (Plain Text)</h3>
                  <p className="text-gray-300">The original data that contains sensitive information</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg border border-accent-purple/30">
                  <h3 className="text-lg font-bold text-primary-purple mb-2">Mr. Hyde (Encrypted Form)</h3>
                  <p className="text-gray-300">The encrypted data that preserves privacy while maintaining mathematical properties</p>
                </div>
              </div>
              <p className="text-gray-300 mt-6">
                Just like Dr. Jekyll and Mr. Hyde are the same person in different states, 
                the encrypted data can be operated on mathematically while preserving complete privacy, 
                then decrypted to reveal the same result as if operations were performed on the original data.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Core Privacy Technologies</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary-purple mb-2">Encryption/Decryption</h3>
                    <p className="text-gray-300 mb-3">AES-256 with lazy decryption to optimize performance while maintaining security.</p>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      <code>{`const encrypted = await privacy.encrypt('sensitive data', 'password');
const decrypted = await privacy.decrypt(encrypted, 'password');`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary-purple mb-2">Zero-Knowledge Proofs</h3>
                    <p className="text-gray-300 mb-3">Range proofs, balance proofs, and custom proofs to verify statements without revealing private data.</p>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      <code>{`const ageProof = await privacy.prove('range', {
  value: 25, // Private value
  min: 18,
  max: 100
});
const isValid = await privacy.verify(ageProof);`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary-purple mb-2">Multi-Party Computation (MPC)</h3>
                    <p className="text-gray-300 mb-3">Threshold secret sharing and secure computation across multiple parties without revealing individual inputs.</p>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      <code>{`const mpcResult = await privacy.performMPC([10, 20, 30], 'sum');`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary-purple mb-2">Fully Homomorphic Encryption (FHE)</h3>
                    <p className="text-gray-300 mb-3">Perform operations on encrypted data without ever decrypting it.</p>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      <code>{`const encryptedA = await privacy.encrypt('dataA', 'password');
const encryptedB = await privacy.encrypt('dataB', 'password');
const fheResult = await privacy.performFHE(encryptedA, '+', encryptedB);`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary-purple mb-2">Trusted Execution Environment (TEE)</h3>
                    <p className="text-gray-300 mb-3">Secure computation in hardware enclaves to protect sensitive operations.</p>
                    <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      <code>{`const teeResult = await privacy.performTEE(sensitiveData, 'hash');`}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Setup</h3>
                <p className="text-gray-300 mb-4">Get started with ARCIUM HYDE in minutes:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Install the SDK: <code className="bg-gray-800 px-1 rounded">npm install @arcium/privacy-sdk</code></li>
                  <li>Get your API key from the dashboard</li>
                  <li>Initialize the client:</li>
                </ol>
                <pre className="bg-gray-800 p-3 rounded text-sm mt-3 overflow-x-auto">
                  <code>{`import { ArciumPrivacy } from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com'
});`}</code>
                </pre>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Architecture</h3>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h4 className="font-bold text-primary-purple">Application Layer</h4>
                    <p>Web/Mobile apps with wallet integration</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-purple">SDK Layer</h4>
                    <p>Encryption, ZK Proofs, MPC, FHE, TEE, Composability</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-purple">API Layer</h4>
                    <p>Privacy operations and performance optimization</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Security Best Practices</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary-purple mr-2">•</span>
                    <span>Always use strong, unique passwords</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-purple mr-2">•</span>
                    <span>Implement proper key management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-purple mr-2">•</span>
                    <span>Use HTTPS for all API communications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-purple mr-2">•</span>
                    <span>Validate all inputs to prevent injection attacks</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Getting Started with Development</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-primary-purple mb-4">Installation</h3>
                <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto mb-4">
                  <code>{`# Install dependencies for each component
cd server && npm install
cd ../client && npm install  
cd ../sdk && npm install`}</code>
                </pre>
                <h4 className="text-lg font-bold text-white mb-2">Environment Variables</h4>
                <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                  <code>{`# server/.env
SOLANA_CLUSTER_URL=https://api.mainnet-beta.solana.com
SOLANA_PROGRAM_ID=your_program_id
TEE_ENCLAVE_ID=your_enclave_id
TEE_VERIFICATION_KEY=your_verification_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=8080

# client/.env
NEXT_PUBLIC_SOLANA_CLUSTER_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary-purple mb-4">Running the Application</h3>
                <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto mb-4">
                  <code>{`# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
cd client  
npm run dev`}</code>
                </pre>
                
                <h3 className="text-xl font-bold text-white mb-4">Testing</h3>
                <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                  <code>{`# Run all tests
npm test

# Run specific tests
cd server && npm test
cd client && npm test
cd sdk && npm test`}</code>
                </pre>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-3">Need help?</h3>
              <p className="text-gray-400 mb-4">Visit our support resources</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://github.com/arcium-hq" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.602-3.369-1.34-3.369-1.34-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                  GitHub
                </a>
                <a href="https://discord.com/invite/arcium" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 127.14 96.36" aria-hidden="true">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.59,97.59,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                  </svg>
                  Discord Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentationPage;