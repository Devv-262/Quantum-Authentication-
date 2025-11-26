/**
 * API Service for Quantum Authentication
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, message: error.message };
    }
  }

  async register(userData) {
    return await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUser(token) {
    return await this.request('/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateBiometrics(token, biometricData) {
    return await this.request('/update-biometrics', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(biometricData),
    });
  }
}

const api = new ApiService();
export default api;