import React from 'react';
import { Shield, User, Mail, Calendar, CheckCircle, XCircle, Activity } from 'lucide-react';

function Dashboard({ user, token }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{user.username}</h2>
            <p className="text-purple-200">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Account Created</h3>
            </div>
            <p className="text-purple-200">{formatDate(user.created_at)}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Last Login</h3>
            </div>
            <p className="text-purple-200">{formatDate(user.last_login)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 mb-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          Biometric Security Status
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center">
                👤
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Face Authentication</h4>
                <p className="text-purple-300 text-sm">MediaPipe 468-point facial landmarks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.biometrics_registered?.face ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Registered</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-semibold">Not Registered</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center">
                🔐
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Password Protection</h4>
                <p className="text-purple-300 text-sm">Argon2 memory-hard hashing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center">
                ⚛️
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Quantum Encryption</h4>
                <p className="text-purple-300 text-sm">Kyber-768 post-quantum cryptography</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">Protected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-3">Security Features Active</h3>
        <div className="grid md:grid-cols-2 gap-4 text-purple-100">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Post-Quantum Key Encapsulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Quantum Random Number Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Zero Raw Biometric Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>JWT Session Management</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>AES-256 Data Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Secure CORS Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
