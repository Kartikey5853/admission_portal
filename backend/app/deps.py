from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from . import crud, models, schemas
from .database import get_db
from .security import SECRET_KEY, ALGORITHM # Import from security.py

# This tells FastAPI what URL to check for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_student(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> models.Student:
    """
    Decodes the JWT token, validates the user, and returns the
    student object from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None or role is None:
            raise credentials_exception
        if role != "student":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a student")
            
    except JWTError:
        raise credentials_exception
    
    student = crud.get_student_by_email(db, email=email)
    if student is None:
        raise credentials_exception
    return student


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.Admin:
    """
    Decodes the JWT token, validates the user as an admin, and returns the
    admin object from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    forbidden_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")

        if email is None or role is None:
            raise credentials_exception
        # Check if the role is one of the admin types
        if role not in ["admin", "superadmin"]:
            raise forbidden_exception

    except JWTError:
        raise credentials_exception

    admin = crud.get_admin_by_email(db, email=email)
    if admin is None:
        raise credentials_exception
    return admin