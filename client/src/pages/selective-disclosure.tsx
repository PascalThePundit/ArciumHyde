import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card'; // Import the Card component

const SelectiveDisclosurePage: React.FC = () => {
  return (
    <Layout>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-8">
        <Card className="max-w-xl w-full mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Selective Disclosure</h1>
          <p className="text-lg text-gray-300">Control what you share, when you share it. (Content coming soon)</p>
        </Card>
      </div>
    </Layout>
  );
};

export default SelectiveDisclosurePage;
