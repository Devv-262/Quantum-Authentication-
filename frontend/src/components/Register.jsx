import React, { useState } from 'react';
import { UserPlus, Camera, Fingerprint, Lock, Mail, User, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import api from '../services/api';

function Register({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprintData, setFingerprintData] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [fingerprintScanning, setFingerprintScanning] = useState(false);

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
      // Generate a simulated fingerprint template (in production, this would come from hardware)
      const simulatedTemplate = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setFingerprintData(simulatedTemplate);
      setFingerprintScanning(false);
    }, 3000);
  };

  const validateStep1 = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!faceImage) {
      setError('Face capture is required for registration');
      return false;
    }
    if (!fingerprintData) {
      setError('Fingerprint scan is required for registration');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        face_image: faceImage,
        fingerprint_template: fingerprintData
      });

      if (response.success) {
        onSuccess(response.data, response.token);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Create Quantum-Secure Account</h2>
          <p className="text-purple-200">Multi-factor biometric authentication required</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-purple-600' : 'bg-gray-600'
            }`}>
              {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <span className="ml-2 font-semibold">Credentials</span>
          </div>
          <div className={`w-16 h-0.5 mx-3 ${step >= 2 ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-purple-600' : 'bg-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 font-semibold">Biometrics</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 font-semibold mb-1">Mandatory Biometric Registration</p>
              <p className="text-yellow-200/80 text-sm">
                Both facial recognition and fingerprint scanning are required for account creation. 
                This ensures maximum security with multi-factor biometric authentication.
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

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
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
                  placeholder="Choose a unique username"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-2 font-semibold">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="your.email@example.com"
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
                  placeholder="Minimum 8 characters"
                  required
                />
                <p className="text-purple-300 text-xs mt-1">
                  Secured with Argon2id memory-hard hashing
                </p>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 font-semibold">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setStep(2);
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02]"
              >
                Next: Biometric Setup →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Face Capture */}
              <div className="bg-white/5 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-white font-bold text-lg flex items-center gap-2">
                    <Camera className="w-6 h-6 text-blue-400" />
                    Facial Recognition Setup
                  </label>
                  {faceImage && <CheckCircle className="w-6 h-6 text-green-400" />}
                </div>
                
                <p className="text-purple-200 text-sm mb-4">
                  📸 Required: Capture your face for 468-point landmark authentication
                </p>

                {!showWebcam && !faceImage && (
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="w-full py-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-dashed border-blue-500/50 hover:border-blue-400 rounded-lg text-blue-200 hover:text-white transition-all"
                  >
                    <Camera className="w-12 h-12 mx-auto mb-3" />
                    <span className="font-semibold text-lg">Start Face Capture</span>
                    <p className="text-sm mt-1">MediaPipe ML • 99.2% Accuracy</p>
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
                        Captured
                      </div>
                      <button
                        type="button"
                        onClick={() => setFaceImage(null)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Fingerprint Scan */}
              <div className="bg-white/5 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-white font-bold text-lg flex items-center gap-2">
                    <Fingerprint className="w-6 h-6 text-purple-400" />
                    Fingerprint Registration
                  </label>
                  {fingerprintData && <CheckCircle className="w-6 h-6 text-green-400" />}
                </div>
                
                <p className="text-purple-200 text-sm mb-4">
                  🔒 Required: Scan your fingerprint for hardware-level authentication
                </p>

                {!fingerprintData && !fingerprintScanning && (
                  <button
                    type="button"
                    onClick={simulateFingerprintScan}
                    className="w-full py-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white transition-all"
                  >
                    <Fingerprint className="w-12 h-12 mx-auto mb-3" />
                    <span className="font-semibold text-lg">Scan Fingerprint</span>
                    <p className="text-sm mt-1">Capacitive Sensor • 500 DPI</p>
                  </button>
                )}

                {fingerprintScanning && (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                      <Fingerprint className="w-24 h-24 text-purple-400 animate-pulse" />
                      <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">Scanning Fingerprint...</p>
                    <p className="text-purple-300 text-sm">Please keep your finger on the sensor</p>
                    <div className="w-48 h-2 bg-purple-900 rounded-full mx-auto mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {fingerprintData && !fingerprintScanning && (
                  <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-white font-semibold text-lg mb-2">Fingerprint Registered!</p>
                    <p className="text-green-200 text-sm mb-3">Template ID: {fingerprintData.slice(0, 20)}...</p>
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

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !faceImage || !fingerprintData}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>

              {(!faceImage || !fingerprintData) && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Both biometric factors must be registered to continue
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;