import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Link from 'next/link';
import Button from '../components/Button';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalOperations: 142,
    encryptedData: '2.4 TB',
    zkProofsGenerated: 89,
    secureComputations: 56,
    privacyScore: 98,
  });

  const recentActivity = [
    { id: 1, action: 'Zero-Knowledge Proof Generated', time: '2 min ago', status: 'Success' },
    { id: 2, action: 'MPC Operation Completed', time: '15 min ago', status: 'Success' },
    { id: 3, action: 'Data Encrypted', time: '1 hour ago', status: 'Success' },
    { id: 4, action: 'TEE Operation Verified', time: '3 hours ago', status: 'Success' },
  ];

  return (
    <Layout>
      <Header />
      <div className="min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-white font-bold">ARCI</span>
              <span className="text-primary-purple font-extrabold">U</span>
              <span className="text-white font-bold">M</span>
              <span className="text-primary-purple font-extrabold">HYDE</span> Dashboard
            </h1>
            <p className="text-gray-400">Comprehensive overview of your privacy operations and system functionality</p>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary-purple/10 to-transparent border-primary-purple/30">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Operations</h3>
              <p className="text-3xl font-bold text-white">{stats.totalOperations}</p>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div className="h-full bg-primary-purple rounded-full w-4/5"></div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-purple/10 to-transparent border-primary-purple/30">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Encrypted Data</h3>
              <p className="text-3xl font-bold text-white">{stats.encryptedData}</p>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div className="h-full bg-primary-purple rounded-full w-3/4"></div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-purple/10 to-transparent border-primary-purple/30">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">ZK Proofs Generated</h3>
              <p className="text-3xl font-bold text-white">{stats.zkProofsGenerated}</p>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div className="h-full bg-primary-purple rounded-full w-5/6"></div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-purple/10 to-transparent border-primary-purple/30">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Privacy Score</h3>
              <p className="text-3xl font-bold text-white">{stats.privacyScore}%</p>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div className="h-full bg-primary-purple rounded-full w-full"></div>
              </div>
            </Card>
          </div>

          {/* System Functionality Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Main Controls */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">System Functionality</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/zk-proofs">
                    <Card className="cursor-pointer transition-all hover:bg-primary-purple/10 border-2 border-transparent hover:border-primary-purple">
                      <h3 className="text-xl font-semibold text-white mb-2">Zero-Knowledge Proofs</h3>
                      <p className="text-gray-400 mb-4">Verify statements without revealing private data</p>
                      <Button className="w-full">Try Now</Button>
                    </Card>
                  </Link>

                  <Link href="/dashboard">
                    <Card className="cursor-pointer transition-all hover:bg-primary-purple/10 border-2 border-transparent hover:border-primary-purple">
                      <h3 className="text-xl font-semibold text-white mb-2">Multi-Party Computation</h3>
                      <p className="text-gray-400 mb-4">Secure computation across multiple parties</p>
                      <Button className="w-full">Try Now</Button>
                    </Card>
                  </Link>

                  <Link href="/selective-encryption-demo">
                    <Card className="cursor-pointer transition-all hover:bg-primary-purple/10 border-2 border-transparent hover:border-primary-purple">
                      <h3 className="text-xl font-semibold text-white mb-2">Homomorphic Encryption</h3>
                      <p className="text-gray-400 mb-4">Computations on encrypted data</p>
                      <Button className="w-full">Try Now</Button>
                    </Card>
                  </Link>

                  <Link href="/advanced-privacy-demo">
                    <Card className="cursor-pointer transition-all hover:bg-primary-purple/10 border-2 border-transparent hover:border-primary-purple">
                      <h3 className="text-xl font-semibold text-white mb-2">Trusted Execution</h3>
                      <p className="text-gray-400 mb-4">Secure operations in protected hardware</p>
                      <Button className="w-full">Try Now</Button>
                    </Card>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{activity.action}</h3>
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded">
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-900/20 flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-gray-400">All services operational</p>
            </Card>

            <Card className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Network Status</h3>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-purple/20 flex items-center justify-center">
                <span className="text-3xl">🌐</span>
              </div>
              <p className="text-gray-400">Secure network active</p>
            </Card>

            <Card className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Security Level</h3>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-purple/20 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <p className="text-gray-400">High encryption active</p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
