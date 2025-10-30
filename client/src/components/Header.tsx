import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="relative z-20 w-full p-4">
      <nav className="container mx-auto flex items-center justify-between bg-white bg-opacity-5 backdrop-filter backdrop-blur-glass rounded-xl px-6 py-3 shadow-lg">
        <Link href="/" className="text-3xl hover:text-accent-purple transition-colors duration-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-white font-bold">ARCI</span>
          <span className="text-primary-purple font-extrabold">U</span>
          <span className="text-white font-bold">M</span>
          <span className="text-primary-purple font-extrabold">HYDE</span>
        </Link>
        <div className="flex space-x-6">
          <Link href="/dashboard" className="text-gray-200 hover:text-primary-purple transition-colors duration-300">
            Dashboard
          </Link>
          <Link href="/zk-proofs" className="text-gray-200 hover:text-primary-purple transition-colors duration-300">
            ZK Proofs
          </Link>
          <Link href="/multiparty-computation" className="text-gray-200 hover:text-primary-purple transition-colors duration-300">
            MPC
          </Link>
          <Link href="/docs" className="text-gray-200 hover:text-primary-purple transition-colors duration-300">
            Documentation
          </Link>
          <Link href="/advanced-privacy-demo" className="text-gray-200 hover:text-primary-purple transition-colors duration-300">
            HYDE Transform
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
