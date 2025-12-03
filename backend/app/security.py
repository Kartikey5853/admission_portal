import os
import bcrypt  # <-- We are using bcrypt directly
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# --- Environment Variables ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set in .env")

# --- NEW, SIMPLER Password Hashing ---

def get_password_hash(password: str) -> str:
    """Hashes a password using bcrypt."""
    # Encode the password as bytes
    password_bytes = password.encode('utf-8')
    
    # Truncate to 72 bytes (bcrypt limit)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    
    # Decode back to a string to store in the DB
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    try:
        # Encode both as bytes
        plain_password_bytes = plain_password.encode('utf-8')
        if len(plain_password_bytes) > 72:
            plain_password_bytes = plain_password_bytes[:72]
            
        hashed_password_bytes = hashed_password.encode('utf-8')
        
        # Check the password
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

# --- JWT Token Creation (This code is unchanged) ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    try:
        # Encode both as bytes
        plain_password_bytes = plain_password.encode('utf-8')
        if len(plain_password_bytes) > 72:
            plain_password_bytes = plain_password_bytes[:72]
            
        hashed_password_bytes = hashed_password.encode('utf-8')
        
        # Check the password
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False