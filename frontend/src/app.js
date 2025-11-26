import React, { useState, useEffect } from 'react';
import { Shield, LogIn, UserPlus, Home, LogOut, Activity } from 'lucide-react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import api from './services/api';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    // Check system health
    api.checkHealth().then(response => {
      if (response.success) {
        setSystemHealth(response.data);
      }
    });

    // Load user if token exists
    if (token) {
      api.getUser(token).then(response => {
        if (response.success) {
          setUser(response.data);
          setView('dashboard');
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      });
    }
  }, [token]);

  const handleRegisterSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    setView('dashboard');
  };

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Quantum Auth</h1>
                <p className="text-xs text-purple-300">Post-Quantum Security</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      view === 'home'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    <Home className="w-4 h-4 inline mr-2" />
                    Home
                  </button>
                  <button
                    onClick={() => setView('login')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      view === 'login'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Login
                  </button>
                  <button
                    onClick={() => setView('register')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      view === 'register'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 inline mr-2" />
                    Register
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-purple-300">
                    Welcome, <span className="text-white font-semibold">{user.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'home' && !user && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Shield className="w-24 h-24 mx-auto text-purple-400 mb-4" />
              <h2 className="text-5xl font-bold text-white mb-4">
                Quantum-Inspired Authentication
              </h2>
              <p className="text-xl text-purple-200 mb-8">
                Next-generation security using Post-Quantum Cryptography and Biometric Verification
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: 'Post-Quantum Crypto',
                  desc: 'Kyber-768 KEM provides quantum-resistant encryption',
                  icon: '🔐'
                },
                {
                  title: 'Face Recognition',
                  desc: 'MediaPipe-based facial authentication with 468-point landmarks',
                  icon: '👤'
                },
                {
                  title: 'Quantum Random',
                  desc: 'True quantum randomness from vacuum fluctuations',
                  icon: '⚛️'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 hover:border-purple-400 transition-all"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-purple-200">{feature.desc}</p>
                </div>
              ))}
            </div>

            {systemHealth && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">System Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-purple-300 text-sm">Cryptography</p>
                    <p className="text-white font-medium">{systemHealth.quantum_crypto.algorithm}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">PQC Available</p>
                    <p className="text-white font-medium">
                      {systemHealth.quantum_crypto.pqc ? '✅ Yes' : '⚠️ Fallback'}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">QRNG Source</p>
                    <p className="text-white font-medium">{systemHealth.quantum_crypto.qrng_source}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Face Detection</p>
                    <p className="text-white font-medium">
                      {systemHealth.biometric_services.face_detection ? '✅ Ready' : '❌ Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12">
              <button
                onClick={() => setView('register')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {view === 'register' && !user && (
          <Register onSuccess={handleRegisterSuccess} />
        )}

        {view === 'login' && !user && (
          <Login onSuccess={handleLoginSuccess} />
        )}

        {view === 'dashboard' && user && (
          <Dashboard user={user} token={token} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-purple-500/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-purple-300 text-sm">
          <p>Quantum-Inspired Authentication System</p>
          <p className="mt-2">Powered by Kyber PQC, MediaPipe, and ANU QRNG</p>
        </div>
      </footer>
    </div>
  );
}

export default App;