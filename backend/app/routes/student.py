import os
import shutil
import time
from typing import List, Optional

from fastapi import (APIRouter, Depends, File, Form, HTTPException, UploadFile,
                     status)
from sqlalchemy.orm import Session

# Import your project's modules correctly
from .. import crud, models, schemas
from ..database import get_db
from ..deps import get_current_student

# Define the router
router = APIRouter()

# Define the directory to store uploads
UPLOAD_DIRECTORY = "uploads"

# --- Document Routes ---

@router.post("/documents/upload", response_model=schemas.Document)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Uploads a single document for the logged-in student.
    Saves the file using the student's application_no.
    """
    # Ensure the upload directory exists
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    timestamp = int(time.time())

    # Safely get file extension
    filename_parts = file.filename.split(".")
    file_extension = filename_parts[-1] if len(filename_parts) > 1 else ''

    # Create filename using application_no
    filename = f"{current_student.application_no}_{doc_type}_{timestamp}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    try:
        # Save the uploaded file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except IOError as e:
        # Handle potential file writing errors
        print(f"Error writing file {file_path}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save uploaded file for doc_type '{doc_type}'.",
         )
    finally:
        # Ensure the file handle is closed
        await file.close() # Use await file.close() for async UploadFile

    # Create the URL path to store in the database
    file_url = f"/{UPLOAD_DIRECTORY}/{filename}"

    # Create or update the document record in the database
    db_doc = crud.create_or_update_document(
        db=db,
        student_id=current_student.id, # Link using the internal student ID
        doc_type=doc_type,
        file_url=file_url
    )

    return db_doc

@router.get("/documents", response_model=List[schemas.Document])
def get_documents(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Gets a list of all documents the currently logged-in student has uploaded.
    """
    return crud.get_student_documents(db=db, student_id=current_student.id)

# --- Profile Routes ---

@router.get("/me", response_model=schemas.Student)
def read_student_me(
    current_student: models.Student = Depends(get_current_student),
    # db: Session = Depends(get_db) # db not strictly needed if only returning current_student
):
    """
    Get the profile of the currently logged-in student.
    The dependency already fetches the student object.
    """
    return current_student


@router.patch("/update", response_model=schemas.Student)
def update_student(
    update_data: schemas.StudentUpdate, # Pydantic model for update payload
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student) # Get the student to update
):
    """
    Update the profile details (personal and optionally academic)
    for the currently logged-in student.
    """
    updated_student = crud.update_student_profile(
        db=db,
        student=current_student,
        update_data=update_data
    )
    return updated_student

# --- Course Route ---

@router.get("/courses", response_model=List[schemas.Course])
def read_courses(db: Session = Depends(get_db)):
    """
    Get a list of all available courses.
    (This could potentially be a public endpoint).
    """
    courses = crud.get_courses(db=db)
    return courses

# --- Application Routes (Separate for EAMCET and Management) ---

@router.post("/apply", response_model=schemas.Application, status_code=status.HTTP_201_CREATED)
def submit_eamcet_application( # Renamed for clarity
    application_data: schemas.ApplicationCreate, # Only expects course_id
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student)
):
    """ Submit a standard EAMCET quota application. """
    # Validate course ID
    course = crud.get_course_by_id(db=db, course_id=application_data.course_id)
    if not course:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    try:
        # Call CRUD function, explicitly setting quota type
        new_application = crud.create_application(
            db=db,
            student_id=current_student.id,
            course_id=application_data.course_id,
            quota_type=models.QuotaTypeEnum.EAMCET # Explicitly EAMCET
        )
        # Map the DB model to the Pydantic response schema
        return schemas.Application.from_orm(new_application)
    except HTTPException as e: # Handle specific errors like duplicate application
        raise e
    except Exception as e:
        print(f"Error creating EAMCET application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not submit EAMCET application."
        )

@router.post("/apply-management", response_model=schemas.ManagementApplication, status_code=status.HTTP_201_CREATED)
def submit_management_application(
    application_data: schemas.ManagementApplicationCreate, # Use specific create schema
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student)
):
    """ Submit a Management Quota application. """
     # Validate course ID
    course = crud.get_course_by_id(db=db, course_id=application_data.course_id)
    if not course:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    try:
        # Call the specific CRUD function for management applications
        new_application = crud.create_management_application(
            db=db,
            student_id=current_student.id,
            course_id=application_data.course_id
        )
        # Map the ManagementApplication DB model to the correct Pydantic schema
        response_data = schemas.ManagementApplication(
             id=new_application.id,
             student_id=new_application.student_id,
             course_id=new_application.course_id,
             status=new_application.status,
             submission_date=new_application.submission_date,
             remarks=new_application.remarks,
             course_name=new_application.course.course_name if new_application.course else "N/A"
        )
        return response_data
    except HTTPException as e: # Handle specific errors like duplicate application
        raise e
    except Exception as e:
        print(f"Error creating management application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not submit management application."
        )

# --- Status Routes (Separate for EAMCET and Management) ---

@router.get("/status", response_model=Optional[schemas.ApplicationStatusResponse])
def get_application_status(
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student)
):
    """
    Get the status of the student's most recent standard (EAMCET) application.
    Returns null if no standard application exists.
    """
    # This CRUD function should specifically look for EAMCET applications if needed,
    # or just the latest overall application if that's the desired logic.
    # Assuming get_student_application fetches the latest *EAMCET* one or latest overall.
    application = crud.get_student_application(db=db, student_id=current_student.id) # Ensure this fetches EAMCET/Standard
    if not application:
        return None

    # Map the Application model to the ApplicationStatusResponse schema
    return schemas.ApplicationStatusResponse(
        id=application.id,
        student_id=application.student_id,
        course_id=application.course_id,
        status=application.status,
        submission_date=application.submission_date,
        remarks=application.remarks,
        course_name=application.course.course_name if application.course else "N/A",
        
    )

@router.get("/status-management", response_model=Optional[schemas.ManagementApplication])
def get_management_application_status(
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student)
):
    """
    Get the status of the student's most recent MANAGEMENT application.
    Returns null if no management application exists.
    """
    # Use the specific CRUD function for management applications
    application = crud.get_student_management_application(db=db, student_id=current_student.id)
    if not application:
        return None

    # Map the ManagementApplication model to the ManagementApplication schema
    response_data = schemas.ManagementApplication(
         id=application.id,
         student_id=application.student_id,
         course_id=application.course_id,
         status=application.status,
         submission_date=application.submission_date,
         remarks=application.remarks,
         course_name=application.course.course_name if application.course else "N/A"
         # No quota_type needed here as it's implicit in the schema/route
    )
    return response_data