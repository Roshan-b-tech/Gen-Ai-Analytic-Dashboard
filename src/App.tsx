import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import QueryInput from './components/QueryInput';
import QueryHistory from './components/QueryHistory';
import ResultsDisplay from './components/ResultsDisplay';
import { Brain, Settings, Bell, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-[#1a0f1f]">
        <nav className="glass-effect sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <button 
                  className="lg:hidden p-2 text-white/70 hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-[#ff3366] to-[#ff6633] p-2 rounded-xl group-hover:scale-105 transition-transform">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <span className="text-2xl font-bold bg-gradient-to-r from-[#ff3366] to-[#ff6633] text-transparent bg-clip-text">
                      Gen AI Analytics
                    </span>
                    <p className="text-xs text-white/50">Powered by AI</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links - Desktop */}
              <div className="hidden lg:flex items-center space-x-8">
                <a href="#" className="text-white/70 hover:text-white transition-all text-sm font-medium">Dashboard</a>
                <a href="#" className="text-white/70 hover:text-white transition-all text-sm font-medium">Analytics</a>
                <a href="#" className="text-white/70 hover:text-white transition-all text-sm font-medium">Reports</a>
                <a href="#" className="text-white/70 hover:text-white transition-all text-sm font-medium">Settings</a>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                <button className="p-2 text-white/70 hover:text-white transition-all relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Bell className="relative" size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3366] rounded-full"></span>
                </button>
                <button className="p-2 text-white/70 hover:text-white transition-all relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Settings className="relative" size={20} />
                </button>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative h-10 w-10 bg-gradient-to-br from-[#ff3366] to-[#ff6633] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-white/5">
              <div className="px-4 py-3 space-y-3">
                <a href="#" className="block text-white/70 hover:text-white transition-all text-sm font-medium py-2">Dashboard</a>
                <a href="#" className="block text-white/70 hover:text-white transition-all text-sm font-medium py-2">Analytics</a>
                <a href="#" className="block text-white/70 hover:text-white transition-all text-sm font-medium py-2">Reports</a>
                <a href="#" className="block text-white/70 hover:text-white transition-all text-sm font-medium py-2">Settings</a>
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Activity - Left Side */}
            <div className="lg:col-span-3">
              <QueryHistory />
            </div>
            
            {/* Search and Visualization - Right Side */}
            <div className="lg:col-span-9 space-y-6">
              <QueryInput />
              <ResultsDisplay />
            </div>
          </div>
        </main>
      </div>
    </Provider>
  );
}

export default App;