import time
from typing import Optional, List  # Ensure 'tuple' is imported correctly for type hints if needed (built-in usually works for Python 3.9+)

from fastapi import HTTPException, status
from sqlalchemy import or_, String, func # Ensure 'func' is imported for timestamps
from sqlalchemy.orm import Session, joinedload # Ensure 'joinedload' is imported

# Import your models and schemas from the correct relative paths
from . import models, schemas, security

# --- Student CRUD ---

def get_student_by_email(db: Session, email: str) -> Optional[models.Student]:
    """Gets a student by their email address."""
    return db.query(models.Student).filter(models.Student.email == email).first()

def get_student_details_by_id(db: Session, student_id: int) -> Optional[models.Student]:
    """
    Fetches a student by ID, eagerly loading related academic details,
    the most recent application (with course), and all documents.
    """
    return (
        db.query(models.Student)
        .options(
            joinedload(models.Student.academic_detail),
            joinedload(models.Student.documents),
            joinedload(models.Student.applications).joinedload(models.Application.course) # Load app and its course
        )
        .filter(models.Student.id == student_id)
        .first()
    )

def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    """Creates a new student and their associated academic details."""
    # Hash the password
    hashed_password = security.get_password_hash(student.password)

    # Generate a unique application number
    app_no = f"TKRCET{int(time.time())}" # Consider a more robust unique ID generation if needed

    # Create the Student object
    db_student = models.Student(
        application_no=app_no,
        name=student.name,
        email=student.email,
        password_hash=hashed_password,
        dob=student.dob,
        gender=student.gender,
        aadhar_no=student.aadhar_no,
        phone=student.phone,
        address=student.address,
        district=student.district,
        category=student.category
        # created_at is handled by the database default
    )

    db.add(db_student)
    db.flush()  # Get the student ID before committing

    # Create the AcademicDetail object including EAMCET fields
    db_academic = models.AcademicDetail(
        student_id=db_student.id,
        exam_board=student.academic_details.exam_board,
        hall_ticket_no=student.academic_details.hall_ticket_no,
        marks_obtained=student.academic_details.marks_obtained,
        max_marks=student.academic_details.max_marks,
        percentage=student.academic_details.percentage,
        passed_year=student.academic_details.passed_year,
        eamcet_hallticket=student.academic_details.eamcet_hallticket, # Include EAMCET field
        eamcet_rank=student.academic_details.eamcet_rank          # Include EAMCET field
    )

    db.add(db_academic)
    try:
        db.commit() # Commit both student and academic details together
        db.refresh(db_student)
        # Eager load academic detail after creation if needed immediately
        # db.refresh(db_student, attribute_names=['academic_detail'])
    except Exception as e:
        db.rollback() # Rollback in case of error
        print(f"Error during student creation commit: {e}") # Log error
        raise # Re-raise the exception
        
    return db_student

def update_student_profile(db: Session, student: models.Student, update_data: schemas.StudentUpdate) -> models.Student:
    """
    Updates the student's profile and/or academic details in the database.
    (Revised approach for nested update)
    """
    print(f"\n--- Debugging update_student_profile (REVISED) for student ID: {student.id} ---")
    print(f"1. Raw update_data received: {update_data.dict(exclude_unset=False)}")

    # Use exclude_unset=True for PATCH behavior (only update provided fields)
    student_update_values = update_data.dict(exclude_unset=True)
    print(f"2. Data after exclude_unset: {student_update_values}")

    academic_update_values = student_update_values.pop('academic_detail', None)
    print(f"3. Extracted academic_update_values: {academic_update_values}")
    print(f"4. Remaining student_update_values: {student_update_values}")

    student_changed = False
    academic_changed = False

    # Update top-level student fields
    if student_update_values:
        print("5. Updating top-level student fields:")
        for key, value in student_update_values.items():
            current_value = getattr(student, key)
            if current_value != value:
                print(f"   - Setting student.{key} = {repr(value)}")
                setattr(student, key, value)
                student_changed = True
    else:
        print("5. No top-level student fields to update.")

    # Update nested academic_detail fields
    if academic_update_values:
        academic_detail = student.academic_detail
        if not academic_detail:
             print("6. WARNING: academic_detail relation is missing for student! Cannot update.")
        else:
            print(f"6. Found academic_detail object (ID: {academic_detail.id}).")
            print(f"7. Processing academic_update_values: {academic_update_values}")
            for key, value in academic_update_values.items():
                 if hasattr(academic_detail, key):
                     current_value = getattr(academic_detail, key)
                     print(f"   - Checking academic_detail.{key}: New={repr(value)}, Current={repr(current_value)}")
                     if value is not None and current_value != value:
                         print(f"     -> Setting academic_detail.{key} = {repr(value)}")
                         setattr(academic_detail, key, value)
                         academic_changed = True
                     elif value is None:
                          print(f"     -> Skipping update for '{key}' because value is None.")
                 else:
                      print(f"   - WARNING: Field '{key}' not found on AcademicDetail model.")
    else:
        print("6. No academic_detail data provided in the update.")


    # Commit if any changes were made
    if student_changed or academic_changed:
        print("--> Changes detected. Attempting commit.")
        try:
            db.commit()
            print("8. db.commit() successful.")
            db.refresh(student)
            if academic_detail and academic_changed:
                db.refresh(academic_detail)

            refreshed_rank = student.academic_detail.eamcet_rank if student.academic_detail else "N/A"
            print(f"9. After refresh, student.academic_detail.eamcet_rank = {refreshed_rank}")

        except Exception as e:
            print(f"!!! ERROR during commit/refresh: {e}")
            db.rollback()
            raise
    else:
        print("8. No changes detected, skipping commit.")

    print("--- End Debugging ---")
    return student

# --- Document CRUD ---

def create_or_update_document(
    db: Session, student_id: int, doc_type: str, file_url: str
) -> models.Document:
    """
    Finds a document for a student by its type.
    - If it exists, update the file_url and timestamp.
    - If it doesn't exist, create a new record.
    """
    db_doc = db.query(models.Document).filter(
        models.Document.student_id == student_id,
        models.Document.doc_type == doc_type
    ).first()

    if db_doc:
        # Update existing document
        db_doc.file_url = file_url
        db_doc.uploaded_on = func.now() # Update timestamp using func
        db_doc.verified = False # Reset verification on new upload
    else:
        # Create new document
        db_doc = models.Document(
            student_id=student_id,
            doc_type=doc_type,
            file_url=file_url,
            verified=False
            # uploaded_on is handled by database default
        )
        db.add(db_doc)

    try:
        db.commit()
        db.refresh(db_doc)
    except Exception as e:
        db.rollback()
        print(f"Error during document commit/refresh: {e}")
        raise
        
    return db_doc

def get_student_documents(db: Session, student_id: int) -> List[models.Document]:
    """Gets all document records for a single student."""
    return db.query(models.Document).filter(models.Document.student_id == student_id).all()

# --- Application CRUD ---

def get_student_application(db: Session, student_id: int) -> Optional[models.Application]:
    """Gets the most recent application for a student, including course info."""
    return (
        db.query(models.Application)
        .options(joinedload(models.Application.course)) # Eager load course data
        .filter(models.Application.student_id == student_id)
        .order_by(models.Application.submission_date.desc())
        .first()
    )

def create_application(
    db: Session,
    student_id: int,
    course_id: int
    # Removed quota_type parameter
) -> models.Application:
    """ Creates a new standard (EAMCET) application record. """
    # ... (check for existing active application - keep this logic) ...
    existing_app = db.query(models.Application).filter(
        models.Application.student_id == student_id,
        models.Application.status.in_([
            models.ApplicationStatusEnum.Pending,
            models.ApplicationStatusEnum.Verified,
            models.ApplicationStatusEnum.Approved
        ])
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student already has an active application (ID: {existing_app.id}, Type: {existing_app.quota_type})."
        )

    db_application = models.Application(
        student_id=student_id,
        course_id=course_id,
        status=models.ApplicationStatusEnum.Pending,
        
        submission_date=func.now()
    )
    db.add(db_application)
    try:
        db.commit()
        db.refresh(db_application)
    except Exception as e:
        db.rollback()
        print(f"Error during EAMCET application creation commit: {e}")
        raise
    return db_application



def get_all_applications(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    
) -> tuple[int, List[models.Application]]:
    """
    Fetches applications with filtering, including quota_type.
    Eagerly loads related student and course data.
    """

    # Start Query - Explicitly select Application, join Student
    query = db.query(models.Application)\
              .join(models.Student)\
              .options(
                  joinedload(models.Application.student), # Eager load student
                  joinedload(models.Application.course)   # Eager load course
              )

    # Apply Search Filter (if provided)
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                models.Student.name.ilike(search_term),
                # Cast application ID to String for case-insensitive search
                models.Application.id.cast(String).ilike(search_term)
            )
        )

    # Apply Status Filter (if provided and not 'all')
    if status and status.lower() != "all":
        try:
            # Attempt case-insensitive comparison with status string
            query = query.filter(models.Application.status.ilike(f"%{status}%"))
        except Exception as e: # Catch potential errors if status isn't a simple string comparison
             print(f"Warning: Error applying status filter '{status}': {e}")

    # Apply Quota Type Filter (if provided)
   
    # Get Total Count (before pagination)
    try:
        total = query.count()
    except Exception as e:
        print(f"Error counting applications: {e}")
        total = 0 # Default to 0 on error

    # Apply Ordering and Pagination
    applications = [] # Default to empty list
    if total > 0:
        try:
            applications = query.order_by(models.Application.submission_date.desc())\
                                .offset(skip)\
                                .limit(limit)\
                                .all()
        except Exception as e:
            print(f"Error fetching paginated applications: {e}")



    return total, applications

def update_application_status(
    db: Session,
    student_id: int,
    new_status: models.ApplicationStatusEnum,
    remarks: str
) -> Optional[models.Application]:
    """Finds the student's most recent application and updates its status and remarks."""
    db_application = get_student_application(db, student_id) # Reuse existing function

    if not db_application:
        return None # No application found

    db_application.status = new_status
    db_application.remarks = remarks
    # Potentially update an 'updated_at' timestamp here if defined in model
    # db_application.updated_at = func.now()

    try:
        db.commit() # Commit changes to the existing application object
        db.refresh(db_application)
    except Exception as e:
        db.rollback()
        print(f"Error during application status update commit: {e}")
        raise

    return db_application


# --- Course CRUD ---

def get_courses(db: Session) -> List[models.Course]:
    """Fetches all available courses."""
    return db.query(models.Course).order_by(models.Course.course_name).all()

def get_course_by_id(db: Session, course_id: int) -> Optional[models.Course]:
    """Gets a single course by its ID."""
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def create_course(db: Session, course: schemas.CourseCreate) -> models.Course:
    """Creates a new course record."""
    # Convert fees_per_year from float to Decimal if your model uses Decimal
    fees = course.fees_per_year
    # from decimal import Decimal
    # if fees is not None:
    #     fees = Decimal(str(fees)) # Example conversion

    db_course = models.Course(
        course_name=course.course_name,
        department=course.department,
        duration=course.duration,
        total_seats=course.total_seats,
        available_seats=course.total_seats, # Initially, available = total
        fees_per_year=fees, # Use potentially converted value
        eligibility=course.eligibility
    )
    db.add(db_course)
    try:
        db.commit()
        db.refresh(db_course)
    except Exception as e:
        db.rollback()
        print(f"Error during course creation commit: {e}")
        raise
    return db_course

def update_course(db: Session, course_id: int, course_update: schemas.CourseUpdate) -> Optional[models.Course]:
    """Updates an existing course."""
    db_course = get_course_by_id(db, course_id)
    if not db_course:
        return None

    update_data = course_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        # Handle potential type conversion for Decimal if needed
        # if key == 'fees_per_year' and value is not None:
        #     from decimal import Decimal
        #     value = Decimal(str(value))
        setattr(db_course, key, value)

    try:
        db.commit()
        db.refresh(db_course)
    except Exception as e:
        db.rollback()
        print(f"Error during course update commit: {e}")
        raise
    return db_course

def delete_course(db: Session, course_id: int) -> Optional[models.Course]:
    """Deletes a course."""
    db_course = get_course_by_id(db, course_id)
    if not db_course:
        return None

    # Optional: Check for existing applications referencing this course
    app_count = db.query(models.Application).filter(models.Application.course_id == course_id).count()
    if app_count > 0:
        # Consider whether to prevent deletion or handle cascading deletes/nullifying FKs
        print(f"Warning: Deleting course {course_id} which has {app_count} associated applications.")
        # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete course with existing applications")

    db.delete(db_course)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during course deletion commit: {e}")
        raise
    return db_course # Return the object before deletion, or None after commit? Standard practice varies.

# --- Admin CRUD ---
def get_admin_by_email(db: Session, email: str) -> Optional[models.Admin]:
    """Gets an admin by their email address."""
    return db.query(models.Admin).filter(models.Admin.email == email).first()



def create_management_application(
    db: Session,
    student_id: int,
    course_id: int
) -> models.ManagementApplication: # Return the new model type
    """ Creates a new Management Quota application record. """
    # Check if student already has an active MANAGEMENT application
    existing_app = db.query(models.ManagementApplication).filter( # Query the new table
        models.ManagementApplication.student_id == student_id,
        models.ManagementApplication.status.in_([ # Use the correct status enum values
            models.ApplicationStatusEnum.Pending,
            models.ApplicationStatusEnum.Verified,
            models.ApplicationStatusEnum.Approved
        ])
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student already has an active Management application (ID: {existing_app.id})."
        )

    db_application = models.ManagementApplication( # Use the new model
        student_id=student_id,
        course_id=course_id,
        status=models.ApplicationStatusEnum.Pending, # Set initial status
        submission_date=func.now()
    )
    db.add(db_application)
    try:
        db.commit()
        db.refresh(db_application)
    except Exception as e:
        db.rollback()
        print(f"Error creating Management application commit: {e}")
        raise
    return db_application

def get_student_management_application(db: Session, student_id: int) -> Optional[models.ManagementApplication]:
    """Gets the most recent MANAGEMENT application for a student."""
    return (
        db.query(models.ManagementApplication) # Query the new table
        .options(joinedload(models.ManagementApplication.course)) # Load its course
        .filter(models.ManagementApplication.student_id == student_id)
        .order_by(models.ManagementApplication.submission_date.desc())
        .first()
    )

def get_all_management_applications(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
) -> tuple[int, List[models.ManagementApplication]]: # Return list of new model type
    """ Fetches MANAGEMENT applications with filtering. """
    query = db.query(models.ManagementApplication)\
              .join(models.Student)\
              .options(
                  joinedload(models.ManagementApplication.student), # Load student via new relationship
                  joinedload(models.ManagementApplication.course)
              )

    # Apply Search Filter
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                models.Student.name.ilike(search_term),
                models.ManagementApplication.id.cast(String).ilike(search_term) # Search ID on new table
            )
        )

    # Apply Status Filter
    if status and status.lower() != "all":
        try:
            query = query.filter(models.ManagementApplication.status.ilike(f"%{status}%")) # Filter on new table
        except Exception as e:
             print(f"Warning: Error applying status filter '{status}': {e}")

    # Get Total Count
    total = query.count()

    # Apply Ordering and Pagination
    applications = query.order_by(models.ManagementApplication.submission_date.desc())\
                        .offset(skip)\
                        .limit(limit)\
                        .all()

    return total, applications

def update_management_application_status(
    db: Session,
    # Can accept student_id or application_id depending on preference
    application_id: int, # Let's use application ID here
    new_status: models.ApplicationStatusEnum,
    remarks: str
) -> Optional[models.ManagementApplication]:
    """ Updates status and remarks for a specific MANAGEMENT application. """
    db_application = db.query(models.ManagementApplication)\
                       .filter(models.ManagementApplication.id == application_id)\
                       .first()

    if not db_application:
        return None # No application found

    db_application.status = new_status
    db_application.remarks = remarks
    # Potentially update an 'updated_at' timestamp

    try:
        db.commit()
        db.refresh(db_application)
    except Exception as e:
        db.rollback()
        print(f"Error during Management application status update commit: {e}")
        raise
    return db_application


def get_management_application_details_by_id(db: Session, application_id: int) -> Optional[models.ManagementApplication]:
    """
    Fetches a single Management Application by its ID, eagerly loading
    related student (with academic details) and course.
    """
    return (
        db.query(models.ManagementApplication)
        .options(
            # Load student, then within student, load academic_detail
            joinedload(models.ManagementApplication.student).joinedload(models.Student.academic_detail),
            joinedload(models.ManagementApplication.course) # Load course
        )
        .filter(models.ManagementApplication.id == application_id)
        .first()
    )