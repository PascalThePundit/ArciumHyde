import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Link from 'next/link';
import Button from '../components/Button';
import Card from '../components/Card';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Header />
      <div className="min-h-[calc(100vh-8rem)] text-center p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-white font-bold">ARCI</span>
              <span className="text-primary-purple font-extrabold">U</span>
              <span className="text-white font-bold">M</span>
              <span className="text-primary-purple font-extrabold">HYDE</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Privacy Platform</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Experience comprehensive privacy protection with cutting-edge cryptographic technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Link href="/zk-proofs">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Zero-Knowledge Proofs</h2>
                <p className="text-gray-400 mb-4">Verify statements without revealing private data</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Multi-Party Computation</h2>
                <p className="text-gray-400 mb-4">Compute on encrypted data without decryption</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/selective-disclosure">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Selective Disclosure</h2>
                <p className="text-gray-400 mb-4">Share only necessary information from private data</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/selective-encryption-demo">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Homomorphic Encryption</h2>
                <p className="text-gray-400 mb-4">Perform computations on encrypted data</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">🧮</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/advanced-privacy-demo">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Trusted Execution</h2>
                <p className="text-gray-400 mb-4">Secure computation in hardware-protected environments</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-purple/20">
                <h2 className="text-2xl font-bold text-white mb-4">Privacy Dashboard</h2>
                <p className="text-gray-400 mb-4">Monitor and manage all privacy operations</p>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-purple/20 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-block p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Solve Real Privacy Challenges</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Explore practical demonstrations of privacy technologies solving real-world challenges.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => window.location.href='/dashboard'}>
                  Explore Use Cases
                </Button>
                <Button onClick={() => window.location.href='/docs'}>
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;