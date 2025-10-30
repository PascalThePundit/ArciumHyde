import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary-black text-gray-200 relative overflow-hidden">
      {/* Aesthetic shapes and circles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Large, subtle purple circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-purple rounded-full opacity-5 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-purple rounded-full opacity-5 blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary-purple rounded-full opacity-5 blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-accent-purple rounded-full opacity-5 blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;