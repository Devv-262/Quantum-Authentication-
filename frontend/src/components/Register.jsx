import React, { useState } from 'react';
import { UserPlus, Camera, Fingerprint, Lock, Mail, User, Loader } from 'lucide-react';
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
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        face_image: faceImage
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-purple-200">Register with quantum-secure authentication</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-purple-600' : 'bg-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2">Credentials</span>
          </div>
          <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-purple-600' : 'bg-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2">Biometrics</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="Confirm your password"
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
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                Next: Biometric Setup
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 mb-4">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Face Authentication (Optional)
                </label>
                
                {!showWebcam && !faceImage && (
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="w-full py-4 bg-white/10 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-lg text-purple-200 hover:text-white transition-all"
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    Capture Face
                  </button>
                )}

                {showWebcam && (
                  <WebcamCapture onCapture={handleFaceCapture} onCancel={() => setShowWebcam(false)} />
                )}

                {faceImage && !showWebcam && (
                  <div className="relative">
                    <img src={faceImage} alt="Captured face" className="w-full rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setFaceImage(null)}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                      Retake
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;