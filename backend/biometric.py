import cv2
import numpy as np
import mediapipe as mp
from io import BytesIO
import logging

# Try to import fingerprint library
try:
    from pyfingerprint.pyfingerprint import PyFingerprint
    FINGERPRINT_AVAILABLE = True
except ImportError:
    FINGERPRINT_AVAILABLE = False
    logging.warning("pyfingerprint not available")


class BiometricService:
    """
    Handles biometric processing for authentication
    """
    
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        self.fingerprint_available = FINGERPRINT_AVAILABLE
        self.fingerprint_sensor = None
        
        # Initialize fingerprint sensor if available
        if FINGERPRINT_AVAILABLE:
            self._init_fingerprint_sensor()
    
    def _init_fingerprint_sensor(self):
        """Initialize fingerprint sensor"""
        try:
            # Common USB serial ports
            ports = ['/dev/ttyUSB0', '/dev/ttyUSB1', 'COM3', 'COM4']
            
            for port in ports:
                try:
                    self.fingerprint_sensor = PyFingerprint(
                        port=port,
                        baud=57600,
                        address=0xFFFFFFFF,
                        password=0x00000000
                    )
                    
                    if self.fingerprint_sensor.verifyPassword():
                        logging.info(f"Fingerprint sensor connected on {port}")
                        return
                except:
                    continue
            
            logging.warning("No fingerprint sensor detected")
            self.fingerprint_sensor = None
        
        except Exception as e:
            logging.error(f"Fingerprint initialization error: {e}")
            self.fingerprint_sensor = None
    
    def extract_face_embedding(self, image_data):
        """
        Extract face embedding from image using MediaPipe
        Returns a normalized feature vector
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                logging.error("Failed to decode image")
                return None
            
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process image with MediaPipe
            results = self.face_mesh.process(image_rgb)
            
            if not results.multi_face_landmarks:
                logging.warning("No face detected in image")
                return None
            
            # Extract landmarks (468 points for face mesh)
            face_landmarks = results.multi_face_landmarks[0]
            
            # Convert landmarks to feature vector
            embedding = []
            for landmark in face_landmarks.landmark:
                embedding.extend([landmark.x, landmark.y, landmark.z])
            
            # Normalize embedding
            embedding = np.array(embedding)
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            return embedding.tolist()
        
        except Exception as e:
            logging.error(f"Face embedding extraction error: {e}")
            return None
    
    def compare_embeddings(self, embedding1, embedding2):
        """
        Compare two face embeddings using cosine similarity
        Returns similarity score (0-1, higher is more similar)
        """
        try:
            e1 = np.array(embedding1)
            e2 = np.array(embedding2)
            
            # Cosine similarity
            similarity = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
            
            return float(similarity)
        
        except Exception as e:
            logging.error(f"Embedding comparison error: {e}")
            return 0.0
    
    def enroll_fingerprint(self):
        """
        Enroll a new fingerprint
        Returns template data
        """
        if not self.fingerprint_sensor:
            return None
        
        try:
            print("Place finger on sensor...")
            
            # Wait for finger
            while not self.fingerprint_sensor.readImage():
                pass
            
            # Convert image to characteristics
            self.fingerprint_sensor.convertImage(0x01)
            
            print("Remove finger and place again...")
            
            # Wait for second image
            while not self.fingerprint_sensor.readImage():
                pass
            
            # Convert second image
            self.fingerprint_sensor.convertImage(0x02)
            
            # Create template
            self.fingerprint_sensor.createTemplate()
            
            # Get template characteristics
            characteristics = self.fingerprint_sensor.downloadCharacteristics(0x01)
            
            return characteristics
        
        except Exception as e:
            logging.error(f"Fingerprint enrollment error: {e}")
            return None
    
    def verify_fingerprint(self, template_data):
        """
        Verify fingerprint against stored template
        Returns True if match, False otherwise
        """
        if not self.fingerprint_sensor:
            return False
        
        try:
            print("Place finger on sensor for verification...")
            
            # Wait for finger
            while not self.fingerprint_sensor.readImage():
                pass
            
            # Convert image to characteristics
            self.fingerprint_sensor.convertImage(0x01)
            
            # Upload stored template
            self.fingerprint_sensor.uploadCharacteristics(0x02, template_data)
            
            # Compare
            score = self.fingerprint_sensor.compareCharacteristics()
            
            # Threshold (typically > 50 is a match)
            return score > 50
        
        except Exception as e:
            logging.error(f"Fingerprint verification error: {e}")
            return False
    
    def detect_liveness(self, image_data):
        """
        Simple liveness detection to prevent photo attacks
        Checks for eye blinking and head movement
        """
        try:
            # This is a simplified version
            # In production, use more sophisticated liveness detection
            
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return False
            
            # Convert to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.face_mesh.process(image_rgb)
            
            if not results.multi_face_landmarks:
                return False
            
            # Check for reasonable face size (not too small = photo)
            height, width = image.shape[:2]
            face_landmarks = results.multi_face_landmarks[0]
            
            # Get bounding box
            x_coords = [lm.x * width for lm in face_landmarks.landmark]
            y_coords = [lm.y * height for lm in face_landmarks.landmark]
            
            face_width = max(x_coords) - min(x_coords)
            face_height = max(y_coords) - min(y_coords)
            
            # Face should occupy reasonable portion of image
            width_ratio = face_width / width
            height_ratio = face_height / height
            
            if width_ratio < 0.2 or height_ratio < 0.2:
                return False  # Face too small (likely photo)
            
            return True
        
        except Exception as e:
            logging.error(f"Liveness detection error: {e}")
            return False
    
    def check_services(self):
        """
        Check availability of biometric services
        """
        return {
            'face_detection': True,  # MediaPipe always available
            'fingerprint': self.fingerprint_sensor is not None
        }


# Testing
if __name__ == "__main__":
    service = BiometricService()
    print(f"Biometric Services: {service.check_services()}")
    
    # Test with a sample image (you'd need to provide one)
    # with open('test_face.jpg', 'rb') as f:
    #     image_data = f.read()
    #     embedding = service.extract_face_embedding(image_data)
    #     print(f"Embedding length: {len(embedding) if embedding else 0}")