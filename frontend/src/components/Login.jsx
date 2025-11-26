// ============== Login.jsx ==============
import React, { useState } from 'react';
import { LogIn, Camera, Lock, User, Loader } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import api from '../services/api';

function Login({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [faceImage, setFaceImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login({
        username: formData.username,
        password: formData.password,
        face_image: faceImage
      });

      if (response.success) {
        onSuccess(response.data, response.token);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <LogIn className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-purple-200">Login with your credentials and biometrics</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;