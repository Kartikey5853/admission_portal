from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..import schemas, crud, models, security
from ..database import get_db

router = APIRouter()

@router.post(
    "/register",
    response_model=schemas.Student,
    status_code=status.HTTP_201_CREATED
)
def register_student(
    student: schemas.StudentCreate, 
    db: Session = Depends(get_db)
):
    """
    Register a new student.
    - Checks if email is already registered.
    - Creates a new Student record.
    - Creates a new AcademicDetail record linked to the student.
    """
    db_student = crud.get_student_by_email(db, email=student.email)
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_student(db=db, student=student)


@router.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Student login endpoint.
    - Takes form data: `username` (which is the email) and `password`.
    - Verifies credentials.
    - Returns a JWT access token.
    """
    # Step 1: Find the user by email
    student = crud.get_student_by_email(db, email=form_data.username)
    
    # Step 2: Verify the password using our new bcrypt function
    if not student or not security.verify_password(form_data.password, student.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Step 3: Create and return the token
    access_token = security.create_access_token(
        data={"sub": student.email, "role": "student"} 
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Student login endpoint.
    - Takes form data: `username` (which is the email) and `password`.
    - Verifies credentials.
    - Returns a JWT access token.
    """
    student = crud.get_student_by_email(db, email=form_data.username)
    
    if not student or not security.verify_password(form_data.password, student.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create and return the JWT token
    access_token = security.create_access_token(
        data={"sub": student.email, "role": "student"} # Add role for frontend
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/admin/login", response_model=schemas.Token)
def login_admin(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Admin login endpoint.
    - Takes form data: `username` (which is the admin email) and `password`.
    - Verifies credentials against the 'admins' table.
    - Returns a JWT access token with an 'admin' role.
    """
    # Note: The form's 'username' field will be used for the admin's email
    admin = crud.get_admin_by_email(db, email=form_data.username)
    
    if not admin or not security.verify_password(form_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create and return the JWT token
    access_token = security.create_access_token(
        data={"sub": admin.email, "role": admin.role} # Add admin role
    )
    return {"access_token": access_token, "token_type": "bearer"}

