import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

const HowToUsePage: React.FC = () => {
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
            <h2 className="text-2xl font-bold text-white mb-4">Integration Guide</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Learn how to integrate ARCIUM HYDE privacy technologies into your systems for 
              supply chain verification, credit scoring, private analysis, and more.
            </p>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Getting Started with ARCIUM HYDE</h2>
              <p className="text-gray-300 mb-6">
                ARCIUM HYDE provides a comprehensive privacy-as-a-service platform that can be integrated 
                into existing systems to enable privacy-preserving operations across multiple domains.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-bold text-primary-purple mb-2">Prerequisites</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Node.js 14+ or compatible runtime</li>
                    <li>• API key from ARCIUM HYDE dashboard</li>
                    <li>• HTTPS connection for secure communication</li>
                    <li>• Basic understanding of privacy concepts</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-bold text-primary-purple mb-2">Integration Methods</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• REST API endpoints</li>
                    <li>• JavaScript/TypeScript SDK</li>
                    <li>• Direct backend-to-backend integration</li>
                    <li>• Plugin architecture for existing systems</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Supply Chain Verification</h2>
              <p className="text-gray-300 mb-6">
                Use ARCIUM HYDE to verify product authenticity and compliance without revealing 
                proprietary manufacturing processes or supplier relationships.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 1: Data Preparation</h3>
                  <p className="text-gray-300 text-sm">
                    Prepare supply chain data including product IDs, manufacturing details, 
                    and compliance certifications.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 2: Privacy Processing</h3>
                  <p className="text-gray-300 text-sm">
                    Apply selective disclosure to share only necessary verification attributes 
                    without exposing sensitive details.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 3: Verification</h3>
                  <p className="text-gray-300 text-sm">
                    Share verification proofs with stakeholders while maintaining 
                    confidentiality of business processes.
                  </p>
                </Card>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-bold text-primary-purple mb-2">Example Use Case</h4>
                <p className="text-gray-300 text-sm">
                  A pharmaceutical company can prove that their drugs were manufactured under 
                  required conditions without revealing proprietary manufacturing processes. 
                  Retailers can verify authenticity without accessing supplier pricing or 
                  manufacturing locations.
                </p>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Credit Scoring</h2>
              <p className="text-gray-300 mb-6">
                Enable financial institutions to perform credit risk assessments without 
                exposing sensitive financial details of applicants.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 1: Data Collection</h3>
                  <p className="text-gray-300 text-sm">
                    Collect financial data from applicants while maintaining local control 
                    of sensitive information.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 2: Privacy-Preserving Analysis</h3>
                  <p className="text-gray-300 text-sm">
                    Use Multi-Party Computation to compute credit scores across multiple 
                    data sources without data exposure.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 3: Score Generation</h3>
                  <p className="text-gray-300 text-sm">
                    Generate credit scores while preserving privacy of both applicant 
                    and institutional data.
                  </p>
                </Card>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-bold text-primary-purple mb-2">Example Use Case</h4>
                <p className="text-gray-300 text-sm">
                  A borrower can prove their creditworthiness to a lender without revealing 
                  exact salary figures, account balances, or detailed spending patterns. 
                  Multiple financial institutions can contribute data to a shared credit 
                  scoring model without exposing their customer data to each other.
                </p>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Private Data Analysis</h2>
              <p className="text-gray-300 mb-6">
                Perform analytics across multiple organizations without exposing sensitive 
                datasets to unauthorized parties.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 1: Data Preparation</h3>
                  <p className="text-gray-300 text-sm">
                    Prepare datasets for analysis ensuring sensitive fields are 
                    appropriately protected before processing.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 2: Secure Computation</h3>
                  <p className="text-gray-300 text-sm">
                    Use Fully Homomorphic Encryption to perform analytics on 
                    encrypted datasets without decryption.
                  </p>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3">Step 3: Result Interpretation</h3>
                  <p className="text-gray-300 text-sm">
                    Extract insights from computations while maintaining 
                    privacy of input datasets.
                  </p>
                </Card>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-bold text-primary-purple mb-2">Example Use Case</h4>
                <p className="text-gray-300 text-sm">
                  Multiple hospitals can jointly analyze treatment effectiveness 
                  without sharing patient data. Retailers can understand market 
                  trends without exposing customer purchase histories or proprietary 
                  pricing information.
                </p>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">API Integration Guide</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Installation</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>{`npm install @arcium/privacy-sdk
# or
yarn add @arcium/privacy-sdk`}</code>
                </pre>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Initialization</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { ArciumPrivacy } from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com'
});`}</code>
                </pre>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Supply Chain Example</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Verify product authenticity without revealing supplier details
const proof = await privacy.prove('product-authenticity', {
  productId: 'PROD-12345',
  manufacturerId: 'MFG-67890',
  complianceRequirements: ['ISO-9001', 'FDA-approved']
});

// Verify the proof
const isValid = await privacy.verify(proof);`}</code>
                </pre>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Credit Scoring Example</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Perform private salary verification
const salaryVerification = await privacy.performMPC([userIncome, minRequired], 'gt');

// Use homomorphic encryption for risk calculations
const encryptedIncome = await privacy.encrypt(userIncome, 'risk-model-key');
const riskScore = await privacy.performFHE(encryptedIncome, 'multiply', riskFactor);`}</code>
                </pre>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Quick Start</h3>
              <p className="text-gray-400">Follow the integration guide to set up ARCIUM HYDE in minutes</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="text-xl font-semibold text-white mb-2">Custom Solutions</h3>
              <p className="text-gray-400">Tailor privacy solutions to your specific business needs</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Compliance Ready</h3>
              <p className="text-gray-400">Built-in compliance with GDPR, CCPA, and HIPAA requirements</p>
            </Card>
          </div>

          <Card className="text-center p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Ready to Integrate?</h3>
            <p className="text-gray-300 mb-6">
              Start implementing privacy-preserving solutions with ARCIUM HYDE today. 
              Our comprehensive documentation and support team will guide you through 
              the integration process.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-primary-purple hover:bg-accent-purple text-white rounded-lg transition-colors">
                Get API Key
              </button>
              <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                View Documentation
              </button>
              <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HowToUsePage;