import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Calendar, Activity, Lock, Zap, TrendingUp, Database, Trash2, AlertTriangle } from 'lucide-react';

function Dashboard({ user, token, onLogout }) {
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [quantumTest, setQuantumTest] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSecurityMetrics();
    fetchAllUsers();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/security/metrics`);
      const data = await response.json();
      if (data.success) {
        setSecurityMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const testQuantumSecurity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/security/test-quantum`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setQuantumTest(data.data);
      }
    } catch (error) {
      console.error('Quantum test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Account deleted successfully');
        onLogout();
      } else {
        alert('Failed to delete account: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* User Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{user.username}</h2>
              <p className="text-purple-200">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500 text-red-300 rounded-lg transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
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

      {/* Security Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          Security Status
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">Password</h4>
            </div>
            <p className="text-sm text-green-300">Argon2id Protected</p>
            <p className="text-xs text-green-200 mt-1">Memory-hard hashing</p>
          </div>

          <div className={`${user.biometrics_registered?.face ? 'bg-green-500/20 border-green-500' : 'bg-yellow-500/20 border-yellow-500'} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-white">Face Auth</h4>
            </div>
            <p className="text-sm text-yellow-300">
              {user.biometrics_registered?.face ? '✅ Registered' : '⚠️ Not Set Up'}
            </p>
            <p className="text-xs text-yellow-200 mt-1">MediaPipe 468-point</p>
          </div>

          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">Quantum Crypto</h4>
            </div>
            <p className="text-sm text-purple-300">Active</p>
            <p className="text-xs text-purple-200 mt-1">Kyber-768 KEM</p>
          </div>
        </div>
      </div>

      {/* Quantum vs Classical Comparison */}
      {securityMetrics && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Quantum vs Classical Security
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">Security Components</h4>
              {securityMetrics.security_comparison?.quantum_features.map((feature, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-purple-300 text-sm mb-2">{feature.name}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 font-semibold">⚛️ {feature.quantum}</p>
                      <p className="text-xs text-green-300">Quantum-Ready</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 font-semibold">🔒 {feature.classical}</p>
                      <p className="text-xs text-gray-300">Classical</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">Security Strength</h4>
              {securityMetrics.security_comparison?.strength_scores && Object.entries(securityMetrics.security_comparison.strength_scores).map(([key, value]) => (
                <div key={key} className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-200 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-white font-bold">{value}%</p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${value >= 90 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-purple-600/20 rounded-lg p-6 border border-purple-500/30">
            <h4 className="text-lg font-semibold text-white mb-4">Encryption Performance</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {securityMetrics.encryption_metrics?.quantum_avg_ms.toFixed(2)}ms
                </p>
                <p className="text-sm text-purple-200">Quantum Encryption</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {securityMetrics.encryption_metrics?.classical_avg_ms.toFixed(2)}ms
                </p>
                <p className="text-sm text-blue-200">Classical Encryption</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {securityMetrics.encryption_metrics?.total_operations}
                </p>
                <p className="text-sm text-green-200">Total Operations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Quantum Security */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-400" />
          Test Quantum Security
        </h3>
        <p className="text-purple-200 mb-4">
          Run real-time tests to see quantum encryption and random number generation in action
        </p>
        <button
          onClick={testQuantumSecurity}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Quantum Tests'}
        </button>

        {quantumTest && (
          <div className="mt-6 space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-lg font-semibold text-white mb-3">Encryption Test Results</h4>
              <div className="space-y-2">
                {quantumTest.encryption_tests?.quantum_operations.map((op, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Test {op.iteration}</span>
                    <span className={`font-mono ${op.success ? 'text-green-400' : 'text-red-400'}`}>
                      Encrypt: {op.encrypt_ms.toFixed(2)}ms | Decrypt: {op.decrypt_ms.toFixed(2)}ms | {op.success ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
                <div className="border-t border-purple-500/30 pt-2 mt-2">
                  <p className="text-white font-semibold">
                    Average: {quantumTest.average_encrypt_ms.toFixed(2)}ms encryption, {quantumTest.average_decrypt_ms.toFixed(2)}ms decryption
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-lg font-semibold text-white mb-3">Quantum Random Numbers</h4>
              <p className="text-purple-300 text-sm mb-3">
                Generated from vacuum fluctuations (ANU QRNG)
              </p>
              <div className="space-y-2">
                {quantumTest.qrng_samples?.map((sample, idx) => (
                  <div key={idx} className="bg-black/30 rounded p-2 font-mono text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-purple-300">Sample {sample.iteration}</span>
                      <span className="text-green-400">{sample.time_ms.toFixed(2)}ms</span>
                    </div>
                    <div className="text-purple-200 break-all">{sample.bytes_hex}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database View */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-400" />
          Database Users ({allUsers.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allUsers.map((u) => (
            <div key={u.id} className="bg-white/5 rounded-lg p-4 border border-purple-500/20 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{u.username}</p>
                  <p className="text-purple-300 text-sm">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-200 text-sm">Joined: {formatDate(u.created_at)}</p>
                  <p className="text-purple-300 text-xs">
                    Face: {u.biometrics?.face ? '✅' : '❌'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 border border-red-500 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-2xl font-bold text-white">Delete Account?</h3>
            </div>
            <p className="text-gray-300 mb-6">
              This action cannot be undone. All your data, including biometric information, will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteAccount();
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;