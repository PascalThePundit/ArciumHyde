import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

const SelectiveDisclosurePage: React.FC = () => {
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
            <h2 className="text-2xl font-bold text-white mb-4">Digital Identity Verification</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Share only necessary attributes from your digital identity without revealing your complete profile. 
              Selective disclosure enables privacy-preserving authentication and authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Digital Identity</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">Full Name: <span className="text-white">John Doe</span></p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">Date of Birth: <span className="text-white">01/15/1990</span></p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">Address: <span className="text-white">123 Private Street</span></p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">SSN: <span className="text-white">***-**-1234</span></p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Selective Disclosure Request</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-primary-purple/20 to-transparent rounded border border-primary-purple/50">
                  <p className="text-gray-400">Service Provider: <span className="text-primary-purple">Online Retailer</span></p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">Requested Attribute: <span className="text-white">Age Verification</span></p>
                  <p className="text-gray-400 text-sm mt-1">Only confirm you're over 18 without revealing exact age</p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400">Requested Attribute: <span className="text-white">Residency</span></p>
                  <p className="text-gray-400 text-sm mt-1">Only confirm you're in required jurisdiction</p>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-primary-purple hover:bg-accent-purple text-white rounded-lg transition-colors">
                Share Selected Attributes
              </button>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy Preserved</h3>
              <p className="text-gray-400">Only share what's necessary, keep the rest private</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">Verification Achieved</h3>
              <p className="text-gray-400">Prove what's required without full disclosure</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-2">Universal Access</h3>
              <p className="text-gray-400">Access services while maintaining privacy</p>
            </Card>
          </div>

          <Card className="text-center p-8">
            <h3 className="text-xl font-semibold text-white mb-4">About Selective Disclosure</h3>
            <p className="text-gray-300 mb-4">
              Selective disclosure enables you to prove specific attributes about yourself without revealing your complete identity. 
              This approach provides the minimum necessary information for verification while protecting your privacy.
            </p>
            <p className="text-gray-300">
              Applications include age verification, professional credentials, financial eligibility, and compliance verification.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SelectiveDisclosurePage;
