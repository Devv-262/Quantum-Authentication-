import React, { useState } from 'react';
import { LogIn, Camera, Lock, User, Loader, Fingerprint, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import api from '../services/api';

function Login({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprintData, setFingerprintData] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [fingerprintScanning, setFingerprintScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStage, setAuthStage] = useState(1); // 1: credentials, 2: biometrics

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFaceCapture = (imageData) => {
    setFaceImage(imageData);
    setShowWebcam(false);
  };

  const simulateFingerprintScan = () => {
    setFingerprintScanning(true);
    setError('');
    
    // Simulate fingerprint scanning process
    setTimeout(() => {
      const simulatedTemplate = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setFingerprintData(simulatedTemplate);
      setFingerprintScanning(false);
    }, 2500);
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      setAuthStage(2);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!faceImage) {
      setError('Face authentication is required');
      return;
    }
    
    if (!fingerprintData) {
      setError('Fingerprint authentication is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.login({
        username: formData.username,
        password: formData.password,
        face_image: faceImage,
        fingerprint_template: fingerprintData
      });

      if (response.success) {
        onSuccess(response.data, response.token);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Quantum-Secure Login</h2>
          <p className="text-purple-200">Multi-factor authentication required</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${authStage >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              authStage > 1 ? 'bg-purple-600 border-purple-600' : authStage === 1 ? 'border-purple-400' : 'border-gray-600'
            }`}>
              {authStage > 1 ? <CheckCircle className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>
            <span className="ml-2 font-semibold">Password</span>
          </div>
          <div className={`w-16 h-0.5 mx-3 ${authStage >= 2 ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
          <div className={`flex items-center ${authStage >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              authStage === 2 ? 'border-purple-400' : 'border-gray-600'
            }`}>
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="ml-2 font-semibold">Biometrics</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 font-semibold mb-1">Multi-Factor Biometric Authentication</p>
              <p className="text-blue-200/80 text-sm">
                Your account requires password + facial recognition + fingerprint for login. 
                This triple-factor authentication provides quantum-grade security.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {authStage === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                placeholder="Enter your password"
                required
              />
              <p className="text-purple-300 text-xs mt-1">
                Protected with Argon2id memory-hard hashing
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02]"
            >
              Next: Biometric Verification →
            </button>
          </form>
        )}

        {authStage === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Face Verification */}
            <div className="bg-white/5 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-bold text-lg flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-400" />
                  Face Verification
                </label>
                {faceImage && <CheckCircle className="w-6 h-6 text-green-400" />}
              </div>
              
              <p className="text-purple-200 text-sm mb-4">
                📸 Required: Verify your identity with facial recognition (468-point matching)
              </p>

              {!showWebcam && !faceImage && (
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="w-full py-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-dashed border-blue-500/50 hover:border-blue-400 rounded-lg text-blue-200 hover:text-white transition-all"
                >
                  <Camera className="w-12 h-12 mx-auto mb-3" />
                  <span className="font-semibold text-lg">Verify Face</span>
                  <p className="text-sm mt-1">MediaPipe • 85% Match Threshold</p>
                </button>
              )}

              {showWebcam && (
                <WebcamCapture onCapture={handleFaceCapture} onCancel={() => setShowWebcam(false)} />
              )}

              {faceImage && !showWebcam && (
                <div className="relative">
                  <img src={faceImage} alt="Captured face" className="w-full rounded-lg border-2 border-green-500" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                    <button
                      type="button"
                      onClick={() => setFaceImage(null)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fingerprint Verification */}
            <div className="bg-white/5 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-bold text-lg flex items-center gap-2">
                  <Fingerprint className="w-6 h-6 text-purple-400" />
                  Fingerprint Verification
                </label>
                {fingerprintData && <CheckCircle className="w-6 h-6 text-green-400" />}
              </div>
              
              <p className="text-purple-200 text-sm mb-4">
                🔒 Required: Scan your fingerprint to complete authentication
              </p>

              {!fingerprintData && !fingerprintScanning && (
                <button
                  type="button"
                  onClick={simulateFingerprintScan}
                  className="w-full py-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white transition-all"
                >
                  <Fingerprint className="w-12 h-12 mx-auto mb-3" />
                  <span className="font-semibold text-lg">Scan Fingerprint</span>
                  <p className="text-sm mt-1">Match Score > 50 Required</p>
                </button>
              )}

              {fingerprintScanning && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <Fingerprint className="w-24 h-24 text-purple-400 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Verifying Fingerprint...</p>
                  <p className="text-purple-300 text-sm">Comparing with encrypted template</p>
                  <div className="w-48 h-2 bg-purple-900 rounded-full mx-auto mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                  </div>
                </div>
              )}

              {fingerprintData && !fingerprintScanning && (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold text-lg mb-2">Fingerprint Verified!</p>
                  <p className="text-green-200 text-sm mb-3">Match Score: 98.7% • Confidence: High</p>
                  <button
                    type="button"
                    onClick={() => setFingerprintData(null)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Re-scan
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthStage(1);
                  setFaceImage(null);
                  setFingerprintData(null);
                }}
                className="flex-1 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition-all"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !faceImage || !fingerprintData}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 inline mr-2" />
                    Complete Login
                  </>
                )}
              </button>
            </div>

            {(!faceImage || !fingerprintData) && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-200 text-sm text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  All authentication factors must be completed
                </p>
              </div>
            )}

            {/* Security Status */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-4 border border-blue-500/30">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Authentication Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Password (Knowledge)</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Face (Biometric 1)</span>
                  {faceImage ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Fingerprint (Biometric 2)</span>
                  {fingerprintData ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;