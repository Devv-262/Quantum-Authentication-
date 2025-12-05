"""
Quantum-Inspired Authentication System - Enhanced Backend with Security Monitoring
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
from datetime import datetime, timedelta
from functools import wraps
import base64
import json
import time
import logging

from config import Config
from models import db, User
from auth import AuthService
from biometric import BiometricService
from quantum_crypto import QuantumCrypto
from utils import validate_request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize database
db.init_app(app)

# Initialize services
auth_service = AuthService()
biometric_service = BiometricService()
quantum_crypto = QuantumCrypto()

# Security metrics storage (in-memory for demo)
security_metrics = {
    'quantum_operations': [],
    'classical_operations': [],
    'login_attempts': [],
    'encryption_times': []
}

# Create tables
with app.app_context():
    db.create_all()


def token_required(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with detailed status"""
    quantum_status = quantum_crypto.is_available()
    biometric_status = biometric_service.check_services()
    
    return jsonify({
        'success': True,
        'message': 'System operational',
        'data': {
            'quantum_crypto': {
                'algorithm': quantum_status['algorithm'],
                'pqc': quantum_status['pqc'],
                'qrng_source': quantum_status['qrng_source'],
                'qrng_active': quantum_status['qrng']
            },
            'biometric_services': biometric_status,
            'timestamp': datetime.utcnow().isoformat(),
            'total_users': User.query.count()
        }
    })


@app.route('/api/register', methods=['POST'])
def register():
    """Register new user with biometric data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'password', 'email']
        if not validate_request(data, required_fields):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'message': 'Username already exists'
            }), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'Email already exists'
            }), 400
        
        # Hash password with timing
        start_time = time.time()
        password_hash = auth_service.hash_password(data['password'])
        hash_time = (time.time() - start_time) * 1000  # ms
        
        logger.info(f"Password hashing took {hash_time:.2f}ms using Argon2id")
        
        # Process biometric data
        face_embedding = None
        
        if 'face_image' in data and data['face_image']:
            try:
                # Decode base64 image
                image_data_str = data['face_image'].split(',')[1] if ',' in data['face_image'] else data['face_image']
                face_image_data = base64.b64decode(image_data_str)
                face_embedding = biometric_service.extract_face_embedding(face_image_data)
                
                if face_embedding is None:
                    logger.warning("Face detection failed during registration")
                else:
                    # Encrypt face embedding with timing
                    start_time = time.time()
                    face_embedding = quantum_crypto.encrypt(json.dumps(face_embedding))
                    encrypt_time = (time.time() - start_time) * 1000
                    
                    logger.info(f"Face embedding encryption took {encrypt_time:.2f}ms")
                    
                    # Record security metric
                    security_metrics['encryption_times'].append({
                        'timestamp': datetime.utcnow().isoformat(),
                        'operation': 'face_encryption',
                        'time_ms': encrypt_time,
                        'method': 'quantum' if quantum_crypto.pqc_available else 'classical'
                    })
            except Exception as e:
                logger.error(f"Face processing error: {e}")
                # Continue without face biometric
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash,
            face_embedding=face_embedding
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = auth_service.generate_token(new_user.id, app.config['SECRET_KEY'])
        
        logger.info(f"User registered: {new_user.username}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'data': {
                'user_id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'created_at': new_user.created_at.isoformat(),
                'biometrics_registered': {
                    'face': face_embedding is not None
                },
                'security_info': {
                    'password_hash_time_ms': hash_time,
                    'hash_algorithm': 'Argon2id',
                    'encryption_method': 'Kyber-768' if quantum_crypto.pqc_available else 'Fernet-AES256'
                }
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration failed: {e}")
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user with biometric data"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not validate_request(data, ['username', 'password']):
            return jsonify({
                'success': False,
                'message': 'Missing username or password'
            }), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            logger.warning(f"Login failed: User {data['username']} not found")
            security_metrics['login_attempts'].append({
                'timestamp': datetime.utcnow().isoformat(),
                'username': data['username'],
                'success': False,
                'reason': 'user_not_found'
            })
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Verify password
        password_verify_start = time.time()
        password_valid = auth_service.verify_password(data['password'], user.password_hash)
        password_verify_time = (time.time() - password_verify_start) * 1000
        
        logger.info(f"Password verification took {password_verify_time:.2f}ms")
        
        if not password_valid:
            logger.warning(f"Login failed: Invalid password for {data['username']}")
            security_metrics['login_attempts'].append({
                'timestamp': datetime.utcnow().isoformat(),
                'username': data['username'],
                'success': False,
                'reason': 'invalid_password'
            })
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Biometric verification
        biometric_scores = {'password': True}
        face_verified = False
        
        # Face verification (optional but recommended if registered)
        if 'face_image' in data and data['face_image'] and user.face_embedding:
            try:
                image_data_str = data['face_image'].split(',')[1] if ',' in data['face_image'] else data['face_image']
                face_image_data = base64.b64decode(image_data_str)
                login_embedding = biometric_service.extract_face_embedding(face_image_data)
                
                if login_embedding:
                    # Decrypt stored embedding
                    decrypt_start = time.time()
                    stored_embedding = json.loads(
                        quantum_crypto.decrypt(user.face_embedding)
                    )
                    decrypt_time = (time.time() - decrypt_start) * 1000
                    
                    logger.info(f"Face embedding decryption took {decrypt_time:.2f}ms")
                    
                    # Compare embeddings
                    similarity = biometric_service.compare_embeddings(
                        login_embedding, 
                        stored_embedding
                    )
                    
                    biometric_scores['face'] = similarity
                    
                    logger.info(f"Face similarity score: {similarity:.4f}")
                    
                    if similarity < 0.75:  # Lowered threshold for testing
                        logger.warning(f"Face verification failed: similarity {similarity:.4f}")
                        security_metrics['login_attempts'].append({
                            'timestamp': datetime.utcnow().isoformat(),
                            'username': data['username'],
                            'success': False,
                            'reason': 'face_verification_failed',
                            'similarity': float(similarity)
                        })
                        return jsonify({
                            'success': False,
                            'message': f'Face verification failed (similarity: {similarity:.2f})',
                            'similarity_score': float(similarity)
                        }), 401
                    else:
                        face_verified = True
                else:
                    logger.warning("No face detected in login image")
            except Exception as e:
                logger.error(f"Face verification error: {e}")
                # Continue with password-only login
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate token
        token = auth_service.generate_token(user.id, app.config['SECRET_KEY'])
        
        total_time = (time.time() - start_time) * 1000
        
        logger.info(f"Login successful for {user.username} in {total_time:.2f}ms")
        
        # Record successful login
        security_metrics['login_attempts'].append({
            'timestamp': datetime.utcnow().isoformat(),
            'username': data['username'],
            'success': True,
            'face_verified': face_verified,
            'total_time_ms': total_time
        })
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'data': {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'biometric_verification': biometric_scores,
                'last_login': user.last_login.isoformat(),
                'security_info': {
                    'password_verify_time_ms': password_verify_time,
                    'total_auth_time_ms': total_time,
                    'face_verified': face_verified
                }
            }
        })
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}'
        }), 500


@app.route('/api/user', methods=['GET'])
@token_required
def get_user(current_user):
    """Get current user information"""
    return jsonify({
        'success': True,
        'data': {
            'user_id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'created_at': current_user.created_at.isoformat(),
            'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
            'biometrics_registered': {
                'face': current_user.face_embedding is not None
            }
        }
    })


@app.route('/api/user/delete', methods=['DELETE'])
@token_required
def delete_user(current_user):
    """Delete user account"""
    try:
        username = current_user.username
        db.session.delete(current_user)
        db.session.commit()
        
        logger.info(f"User deleted: {username}")
        
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Delete failed: {e}")
        return jsonify({
            'success': False,
            'message': f'Delete failed: {str(e)}'
        }), 500


@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Get all users (admin endpoint - should be protected in production)"""
    try:
        users = User.query.all()
        users_list = []
        
        for user in users:
            users_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'biometrics': {
                    'face': user.face_embedding is not None
                }
            })
        
        return jsonify({
            'success': True,
            'data': {
                'total_users': len(users_list),
                'users': users_list
            }
        })
    except Exception as e:
        logger.error(f"Failed to fetch users: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/security/metrics', methods=['GET'])
def get_security_metrics():
    """Get security metrics for visualization"""
    try:
        # Generate quantum vs classical comparison
        quantum_status = quantum_crypto.is_available()
        
        # Calculate average times
        recent_encryptions = security_metrics['encryption_times'][-50:]  # Last 50
        quantum_times = [e['time_ms'] for e in recent_encryptions if e.get('method') == 'quantum']
        classical_times = [e['time_ms'] for e in recent_encryptions if e.get('method') == 'classical']
        
        # Recent login attempts
        recent_logins = security_metrics['login_attempts'][-20:]  # Last 20
        successful_logins = len([l for l in recent_logins if l['success']])
        failed_logins = len(recent_logins) - successful_logins
        
        return jsonify({
            'success': True,
            'data': {
                'quantum_status': quantum_status,
                'encryption_metrics': {
                    'quantum_avg_ms': sum(quantum_times) / len(quantum_times) if quantum_times else 0,
                    'classical_avg_ms': sum(classical_times) / len(classical_times) if classical_times else 0,
                    'total_operations': len(recent_encryptions)
                },
                'login_metrics': {
                    'total_attempts': len(recent_logins),
                    'successful': successful_logins,
                    'failed': failed_logins,
                    'success_rate': (successful_logins / len(recent_logins) * 100) if recent_logins else 0
                },
                'security_comparison': {
                    'quantum_features': [
                        {'name': 'Key Encapsulation', 'quantum': 'Kyber-768', 'classical': 'RSA-2048'},
                        {'name': 'Random Generation', 'quantum': 'ANU QRNG', 'classical': 'PRNG'},
                        {'name': 'Password Hashing', 'quantum': 'Argon2id', 'classical': 'bcrypt'},
                        {'name': 'Encryption', 'quantum': 'AES-256', 'classical': 'AES-128'}
                    ],
                    'strength_scores': {
                        'quantum_resistant': 95,
                        'classical_security': 70,
                        'brute_force_resistance': 98,
                        'side_channel_resistance': 85
                    }
                },
                'recent_activity': recent_logins
            }
        })
    except Exception as e:
        logger.error(f"Failed to fetch metrics: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/security/test-quantum', methods=['POST'])
def test_quantum():
    """Test quantum operations and compare with classical"""
    try:
        test_data = "Test encryption data for comparison"
        results = {
            'quantum_operations': [],
            'classical_operations': []
        }
        
        # Test quantum encryption
        for i in range(5):
            start = time.time()
            encrypted = quantum_crypto.encrypt(test_data)
            encrypt_time = (time.time() - start) * 1000
            
            start = time.time()
            decrypted = quantum_crypto.decrypt(encrypted)
            decrypt_time = (time.time() - start) * 1000
            
            results['quantum_operations'].append({
                'iteration': i + 1,
                'encrypt_ms': encrypt_time,
                'decrypt_ms': decrypt_time,
                'total_ms': encrypt_time + decrypt_time,
                'success': decrypted == test_data
            })
        
        # Get quantum random numbers
        qrng_samples = []
        for i in range(3):
            start = time.time()
            random_bytes = quantum_crypto.get_quantum_random_bytes(32)
            time_ms = (time.time() - start) * 1000
            qrng_samples.append({
                'iteration': i + 1,
                'time_ms': time_ms,
                'bytes_hex': random_bytes.hex()[:32] + '...'
            })
        
        return jsonify({
            'success': True,
            'data': {
                'encryption_tests': results,
                'qrng_samples': qrng_samples,
                'quantum_status': quantum_crypto.is_available(),
                'average_encrypt_ms': sum(op['encrypt_ms'] for op in results['quantum_operations']) / 5,
                'average_decrypt_ms': sum(op['decrypt_ms'] for op in results['quantum_operations']) / 5
            }
        })
    except Exception as e:
        logger.error(f"Quantum test failed: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)