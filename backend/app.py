"""
Quantum-Inspired Authentication System - Main Flask Application
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
from datetime import datetime, timedelta
from functools import wraps
import base64
import json

from config import Config
from models import db, User
from auth import AuthService
from biometric import BiometricService
from quantum_crypto import QuantumCrypto
from utils import validate_request

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize database
db.init_app(app)

# Initialize services
auth_service = AuthService()
biometric_service = BiometricService()
quantum_crypto = QuantumCrypto()

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
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'System operational',
        'data': {
            'quantum_crypto': quantum_crypto.is_available(),
            'biometric_services': biometric_service.check_services(),
            'timestamp': datetime.utcnow().isoformat()
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
        
        # Hash password
        password_hash = auth_service.hash_password(data['password'])
        
        # Process biometric data
        face_embedding = None
        fingerprint_template = None
        
        if 'face_image' in data and data['face_image']:
            # Decode base64 image
            face_image_data = base64.b64decode(data['face_image'].split(',')[1])
            face_embedding = biometric_service.extract_face_embedding(face_image_data)
            
            if face_embedding is None:
                return jsonify({
                    'success': False,
                    'message': 'Failed to detect face in image'
                }), 400
            
            # Encrypt face embedding
            face_embedding = quantum_crypto.encrypt(json.dumps(face_embedding))
        
        if 'fingerprint_template' in data and data['fingerprint_template']:
            # Encrypt fingerprint template
            fingerprint_template = quantum_crypto.encrypt(data['fingerprint_template'])
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash,
            face_embedding=face_embedding,
            fingerprint_template=fingerprint_template
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = auth_service.generate_token(new_user.id, app.config['SECRET_KEY'])
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'data': {
                'user_id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'biometrics_registered': {
                    'face': face_embedding is not None,
                    'fingerprint': fingerprint_template is not None
                }
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user with biometric data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not validate_request(data, ['username', 'password']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Verify password
        if not auth_service.verify_password(data['password'], user.password_hash):
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Biometric verification
        biometric_scores = {'password': True}
        
        # Face verification
        if 'face_image' in data and data['face_image'] and user.face_embedding:
            face_image_data = base64.b64decode(data['face_image'].split(',')[1])
            login_embedding = biometric_service.extract_face_embedding(face_image_data)
            
            if login_embedding:
                # Decrypt stored embedding
                stored_embedding = json.loads(
                    quantum_crypto.decrypt(user.face_embedding)
                )
                
                # Compare embeddings
                similarity = biometric_service.compare_embeddings(
                    login_embedding, 
                    stored_embedding
                )
                
                biometric_scores['face'] = similarity
                
                if similarity < 0.85:  # Threshold
                    return jsonify({
                        'success': False,
                        'message': 'Face verification failed',
                        'similarity_score': float(similarity)
                    }), 401
        
        # Fingerprint verification
        if 'fingerprint_template' in data and data['fingerprint_template'] and user.fingerprint_template:
            stored_template = quantum_crypto.decrypt(user.fingerprint_template)
            
            if data['fingerprint_template'] != stored_template:
                biometric_scores['fingerprint'] = False
                return jsonify({
                    'success': False,
                    'message': 'Fingerprint verification failed'
                }), 401
            else:
                biometric_scores['fingerprint'] = True
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate token
        token = auth_service.generate_token(user.id, app.config['SECRET_KEY'])
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'data': {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'biometric_verification': biometric_scores,
                'last_login': user.last_login.isoformat()
            }
        })
    
    except Exception as e:
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
                'face': current_user.face_embedding is not None,
                'fingerprint': current_user.fingerprint_template is not None
            }
        }
    })


@app.route('/api/update-biometrics', methods=['POST'])
@token_required
def update_biometrics(current_user):
    """Update user biometric data"""
    try:
        data = request.get_json()
        
        # Update face embedding
        if 'face_image' in data and data['face_image']:
            face_image_data = base64.b64decode(data['face_image'].split(',')[1])
            face_embedding = biometric_service.extract_face_embedding(face_image_data)
            
            if face_embedding:
                current_user.face_embedding = quantum_crypto.encrypt(
                    json.dumps(face_embedding)
                )
        
        # Update fingerprint template
        if 'fingerprint_template' in data and data['fingerprint_template']:
            current_user.fingerprint_template = quantum_crypto.encrypt(
                data['fingerprint_template']
            )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Biometrics updated successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Update failed: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)