import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import ZkProofGenerator from '../components/ZkProofGenerator';
import BalanceThresholdProof from '../components/BalanceThresholdProof';

const ZKProofsPage: React.FC = () => {
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
            <h2 className="text-2xl font-bold text-white mb-4">Age Verification Proof</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Prove you meet age requirements (e.g., 18+ for services) without revealing your exact age. 
              Zero-knowledge proofs enable age verification while preserving privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ZkProofGenerator />
            <BalanceThresholdProof />
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-3">Real-World Application</h3>
              <p className="text-gray-300">
                Age verification for online services, voting eligibility, access to restricted content, 
                and compliance with regulations like GDPR and COPPA - all without exposing private information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ZKProofsPage;
