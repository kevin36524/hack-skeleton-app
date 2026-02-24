import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Oath Mail Logo"
            width={40}
            height={40}
            className="rounded-full neon-glow"
          />
          <span className="text-xl font-bold text-white neon-text-cyan">Oath Mail</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link 
            href="/privacy-policy.html" 
            className="text-sm text-gray-400 hover:text-neon-cyan transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-neon-cyan transition-all duration-300">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="neon-text-pink">A Modern Email Client</span>
            <br />
            <span className="neon-text-cyan">for Gmail</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Access and manage your Gmail with a clean, modern interface. 
            Built with privacy in mind — your data stays with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-neon-pink hover:bg-neon-pink/80 text-black font-bold px-8 shadow-neon-pink hover:shadow-neon-pink-lg transition-all duration-300">
                Get Started
              </Button>
            </Link>
            <Link href="/privacy-policy.html">
              <Button size="lg" variant="outline" className="px-8 border-neon-purple text-neon-purple hover:bg-neon-purple/10 hover:shadow-neon-purple transition-all duration-300">
                View Privacy Policy
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-neon-cyan/30 p-6 rounded-xl shadow-neon-cyan-sm hover:shadow-neon-cyan transition-all duration-300 group">
            <div className="w-12 h-12 bg-black border border-neon-cyan rounded-lg flex items-center justify-center mb-4 group-hover:shadow-neon-cyan transition-all duration-300">
              <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 neon-text-cyan">
              Email Management
            </h3>
            <p className="text-gray-400">
              Read and organize your emails with an intuitive interface.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-neon-green/30 p-6 rounded-xl shadow-neon-green-sm hover:shadow-neon-green transition-all duration-300 group">
            <div className="w-12 h-12 bg-black border border-neon-green rounded-lg flex items-center justify-center mb-4 group-hover:shadow-neon-green transition-all duration-300">
              <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 neon-text-green">
              Smart Search
            </h3>
            <p className="text-gray-400">
              Find emails quickly with powerful search capabilities.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-neon-purple/30 p-6 rounded-xl shadow-neon-purple-sm hover:shadow-neon-purple transition-all duration-300 group">
            <div className="w-12 h-12 bg-black border border-neon-purple rounded-lg flex items-center justify-center mb-4 group-hover:shadow-neon-purple transition-all duration-300">
              <svg className="w-6 h-6 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 neon-text-purple">
              Privacy First
            </h3>
            <p className="text-gray-400">
              Your emails are never stored on our servers. Direct Gmail API access only.
            </p>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-24 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4 neon-text-yellow">
            Your Privacy Matters
          </h2>
          <p className="text-gray-400 mb-6">
            We take your privacy seriously. Oath Mail only accesses your Gmail data 
            to display and manage your emails. We never store, share, or sell your data.
          </p>
          <Link 
            href="/privacy-policy.html" 
            className="text-neon-cyan hover:text-neon-pink font-medium transition-colors duration-300"
          >
            Read our full Privacy Policy →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-8 border-t border-gray-800 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Oath Mail Logo"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-500">
                © 2026 Oath Mail. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy-policy.html" 
                className="text-sm text-gray-500 hover:text-neon-cyan transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/login" 
                className="text-sm text-gray-500 hover:text-neon-cyan transition-colors duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
