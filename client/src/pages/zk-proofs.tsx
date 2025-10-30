import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import ZkProofGenerator from '../components/ZkProofGenerator'; // Import the new component
import BalanceThresholdProof from '../components/BalanceThresholdProof'; // Import the new component

const ZKProofsPage: React.FC = () => {
  return (
    <Layout>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Zero-Knowledge Proofs</h1>
        <ZkProofGenerator />
        <BalanceThresholdProof /> {/* Use the BalanceThresholdProof component */}
      </div>
    </Layout>
  );
};

export default ZKProofsPage;
