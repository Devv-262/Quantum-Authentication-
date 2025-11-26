# Quantum-Inspired Authentication System

A cutting-edge full-stack authentication system combining **Post-Quantum Cryptography (PQC)** with **biometric verification** for next-generation security.

## 🌟 Features

### Security
- **Post-Quantum Cryptography**: Kyber-768 KEM (NIST standardized) with Fernet fallback
- **Quantum Random Numbers**: ANU QRNG API with secure local fallback
- **Biometric Authentication**: Face recognition using MediaPipe (468 facial landmarks)
- **Zero Raw Data Storage**: Only encrypted embeddings stored
- **Argon2 Password Hashing**: Memory-hard, GPU-resistant
- **JWT Session Management**: Secure token-based authentication

### Technologies
- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Flask, SQLAlchemy, OpenCV, MediaPipe
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **Encryption**: Kyber KEM, Fernet (AES-256)

---

## 📁 Project Structure

```
quantum-auth/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── models.py              # Database models
│   ├── auth.py                # Authentication logic
│   ├── quantum_crypto.py      # PQC & QRNG implementation
│   ├── biometric.py           # Face & fingerprint processing
│   ├── utils.py               # Helper functions
│   ├── requirements.txt       # Python dependencies
│   └── database.db            # SQLite database (auto-generated)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── components/
│   │   │   ├── Register.jsx   # Registration component
│   │   │   ├── Login.jsx      # Login component
│   │   │   ├── Dashboard.jsx  # User dashboard
│   │   │   └── WebcamCapture.jsx  # Webcam capture
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md                  # This file
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Webcam** (for face authentication)
- **(Optional)** Fingerprint sensor compatible with pyfingerprint

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Optional: Install Post-Quantum Cryptography (liboqs)**
   ```bash
   # On macOS
   brew install liboqs
   pip install liboqs-python

   # On Ubuntu/Debian
   sudo apt-get install liboqs-dev
   pip install liboqs-python

   # On Windows
   # Download from: https://github.com/open-quantum-safe/liboqs
   # Follow the build instructions, then:
   pip install liboqs-python
   ```

5. **Run the backend server:**
   ```bash
   python app.py
   ```
   
   Server will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   Application will open at `http://localhost:3000`

---

## 🔧 Configuration

### Backend Configuration (backend/config.py)

```python
# Security
SECRET_KEY = 'your-secret-key-here'  # Change in production!

# Database
SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'

# Biometric Thresholds
FACE_SIMILARITY_THRESHOLD = 0.85  # 0-1, higher = stricter
FINGERPRINT_MATCH_THRESHOLD = 50   # Fingerprint match score

# CORS (for production)
CORS_ORIGINS = ['http://localhost:3000', 'https://yourdomain.com']
```

### Frontend Configuration

Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### Health Check
```
GET /api/health
```
Returns system status including PQC and QRNG availability.

### Register User
```
POST /api/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "face_image": "data:image/jpeg;base64,..."  // Optional
}
```

### Login
```
POST /api/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123",
  "face_image": "data:image/jpeg;base64,..."  // Optional
}
```

### Get User Info
```
GET /api/user
Authorization: Bearer <token>
```

### Update Biometrics
```
POST /api/update-biometrics
Authorization: Bearer <token>
Content-Type: application/json

{
  "face_image": "data:image/jpeg;base64,..."
}
```

---

## 🔐 Security Architecture

### Encryption Flow

1. **Data Encryption**:
   - User registers with biometric data
   - Face embedding extracted using MediaPipe
   - Embedding encrypted with Kyber KEM or Fernet
   - Only encrypted data stored in database

2. **Authentication Flow**:
   - User provides credentials + biometrics
   - Password verified using Argon2
   - Biometric data decrypted and compared using cosine similarity
   - JWT token issued on successful authentication

### Post-Quantum Cryptography

The system uses **CRYSTALS-Kyber** (Kyber-768):
- **Key Size**: 2400 bytes
- **Ciphertext Size**: 1088 bytes
- **Security Level**: NIST Level 3 (comparable to AES-192)
- **Quantum Resistant**: Yes

**Fallback**: If liboqs is not available, system uses Fernet (AES-256-CBC) with secure key derivation.

### Quantum Random Number Generation

- **Primary Source**: ANU QRNG API (quantum vacuum fluctuations)
- **Fallback**: Python's `secrets` module with entropy mixing
- **Usage**: Salt generation, token creation, key derivation

---

## 🧪 Testing

### Test Backend
```bash
cd backend
python -c "from quantum_crypto import QuantumCrypto; qc = QuantumCrypto(); print(qc.is_available())"
```

### Test Frontend
```bash
cd frontend
npm test
```

### Manual Testing
1. Register a new user with face authentication
2. Log out
3. Log in with same credentials + face
4. Verify dashboard shows biometric status

---

## 🐛 Troubleshooting

### Webcam Not Working
- **Chrome**: Go to Settings > Privacy > Camera and allow access
- **Firefox**: Click the camera icon in address bar when prompted
- **Safari**: Safari > Preferences > Websites > Camera

### liboqs Installation Issues
If you cannot install liboqs, the system will automatically use the Fernet fallback. This provides strong AES-256 encryption, though not quantum-resistant.

### CORS Errors
Ensure backend is running on port 5000 and frontend on port 3000. Update CORS settings in `backend/config.py` if using different ports.

### Face Detection Issues
- Ensure good lighting
- Face the camera directly
- Remove glasses if possible
- Keep face within the oval guide

---

## 🚀 Production Deployment

### Backend (Flask)

1. **Use production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Use PostgreSQL instead of SQLite:**
   ```python
   # config.py
   SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@localhost/quantum_auth'
   ```

3. **Set secure SECRET_KEY:**
   ```bash
   export SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
   ```

4. **Enable HTTPS** (required for webcam in production)

### Frontend (React)

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with nginx or similar**

3. **Update API URL:**
   ```
   REACT_APP_API_URL=https://api.yourdomain.com/api
   ```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    face_embedding TEXT,           -- Encrypted
    fingerprint_template TEXT,     -- Encrypted
    created_at TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN
);
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Resources

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [CRYSTALS-Kyber](https://pq-crystals.org/kyber/)
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- [ANU QRNG](https://qrng.anu.edu.au/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

---

## 🙏 Acknowledgments

- Open Quantum Safe (OQS) project for liboqs
- Australian National University for QRNG API
- Google for MediaPipe
- The quantum computing research community

---

## ⚠️ Security Notice

This is a demonstration project. For production use:
1. Conduct thorough security audits
2. Implement rate limiting
3. Add comprehensive logging
4. Use hardware security modules (HSM) for key storage
5. Implement proper key rotation
6. Add multi-factor authentication layers
7. Follow OWASP security guidelines

---

**Built with ❤️ for quantum-secure future**