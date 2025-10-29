from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional 
from .. import schemas, crud, models 
from ..database import get_db
from ..deps import get_current_admin # Import our admin dependency


router = APIRouter()

@router.get("/students", response_model=schemas.PaginatedStudentApplications)
def read_students(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin), # Protects the route
    page: int = Query(1, ge=1), # Page number, default 1
    size: int = Query(10, ge=1, le=100), # Page size, default 10
    search: Optional[str] = Query(None), # Search query
    status: Optional[str] = Query(None) # Status filter
):
    """
    Retrieve a paginated list of student applications with search and filtering.
    Accessible only by admins.
    """
    skip = (page - 1) * size
    total, applications = crud.get_all_applications(
        db, skip=skip, limit=size, search=search, status=status
    )

    # Map the SQLAlchemy objects to Pydantic schemas
    items = []
    for app in applications:
        # Fetch course name if needed, or assume branch is stored directly
        branch_name = app.course.course_name if app.course else "N/A" # Example if course relationship exists
        items.append(schemas.StudentApplicationDetail(
            id=app.id,
            student_id=app.student_id,
            branch=branch_name, # Map course_name to branch for frontend
            submission_date=app.submission_date,
            status=app.status,
            studentName=app.student.name,
            studentEmail=app.student.email
        ))

    return schemas.PaginatedStudentApplications(
        total=total,
        page=page,
        size=size,
        items=items
    )


@router.post("/colleges", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
def create_new_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Admin endpoint to create a new course."""
    # Optional: Add validation (e.g., check for duplicate course names)
    return crud.create_course(db=db, course=course)

@router.get("/colleges", response_model=List[schemas.Course])
def read_all_courses(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin) # Keep it protected
):
    """Admin endpoint to get all courses."""
    courses = crud.get_courses(db=db)
    return courses

@router.put("/colleges/{course_id}", response_model=schemas.Course)
def update_existing_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Admin endpoint to update a course by ID."""
    updated_course = crud.update_course(db=db, course_id=course_id, course_update=course_update)
    if updated_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return updated_course

@router.delete("/colleges/{course_id}", response_model=schemas.Course)
def delete_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Admin endpoint to delete a course by ID."""
    deleted_course = crud.delete_course(db=db, course_id=course_id)
    if deleted_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    # You might return the deleted object or just a success message
    return deleted_course # Or return {"message": "Course deleted successfully"}


@router.get("/students/{student_id}", response_model=schemas.StudentDetailResponse)
def read_student_details(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """
    Get full details for a specific student, including academic info,
    application, and documents.
    """
    db_student = crud.get_student_details_by_id(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Get the most recent application (if any) from the loaded relationships
    most_recent_application = None
    if db_student.applications:
        # Sort applications by submission date descending if not already ordered by query
        db_student.applications.sort(key=lambda app: app.submission_date, reverse=True)
        most_recent_application = db_student.applications[0]


    # Manually construct the response to include only the most recent application
    response_data = schemas.StudentDetailResponse(
        id=db_student.id,
        application_no=db_student.application_no,
        name=db_student.name,
        email=db_student.email,
        dob=db_student.dob,
        gender=db_student.gender,
        aadhar_no=db_student.aadhar_no,
        phone=db_student.phone,
        address=db_student.address,
        district=db_student.district,
        category=db_student.category,
        created_at=db_student.created_at,
        academic_detail=db_student.academic_detail,
        application=most_recent_application, # Pass only the most recent one
        documents=db_student.documents
    )

    return response_data

@router.get("/students", response_model=schemas.PaginatedStudentApplications)
def read_students(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
   
):
    """ Retrieve applications with search, filtering, and quota_type filter. """
    skip = (page - 1) * size
    total, applications = crud.get_all_applications(
        db, skip=skip, limit=size, search=search, status=status,
        
    )

    items = []
    for app in applications:
        # --- ADD THIS PRINT STATEMENT ---
        print(f"--- Processing DB Application Object ---")
        print(f"ID: {app.id}")
        print(f"Student ID: {app.student_id}")
        # Use getattr to safely check if quota_type exists on the db object
        quota_type_from_db = getattr(app, 'quota_type', '!!! ATTRIBUTE MISSING !!!')
        print(f"Quota Type from DB: {quota_type_from_db}")
        print(f"Status: {app.status}")
        print(f"Student Name: {app.student.name if hasattr(app, 'student') and app.student else 'N/A'}")
        print(f"--- End DB Object ---")
        # --- END ADD PRINT ---

        branch_name = app.course.course_name if hasattr(app, 'course') and app.course else "N/A"
        try:
            item_detail = schemas.StudentApplicationDetail(
                id=app.id,
                student_id=app.student_id,
                branch=branch_name,
                submission_date=app.submission_date,
                status=app.status,
                studentName=app.student.name,
                studentEmail=app.student.email,
                
            )
            items.append(item_detail)
        except AttributeError as e:
            print(f"AttributeError while creating Pydantic object for app ID {app.id}: {e}")
            continue # Skip this problematic record
        except Exception as e: # Catch other potential errors during Pydantic validation
             print(f"Error creating Pydantic object for app ID {app.id}: {e}")
             continue


    print(f"Constructed {len(items)} items for response.")

    return schemas.PaginatedStudentApplications(
        total=total,
        page=page,
        size=size,
        items=items
    )

@router.get("/students/{student_id}", response_model=schemas.StudentDetailResponse)
def read_student_details(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """ Get full details for a specific student (standard application context). """
    db_student = crud.get_student_details_by_id(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    most_recent_application = None
    if db_student.applications:
        # Sort or filter for the relevant standard application if necessary
        db_student.applications.sort(key=lambda app: app.submission_date, reverse=True)
        # Find the first non-management one? Or just latest overall? Depends on desired logic.
        # For simplicity, let's take the absolute latest for now.
        most_recent_application = db_student.applications[0]

    # --- FIX: Ensure StudentDetailResponse schema includes quota_type if needed ---
    response_data = schemas.StudentDetailResponse(
        id=db_student.id,
        application_no=db_student.application_no,
        name=db_student.name,
        email=db_student.email,
        dob=db_student.dob,
        gender=db_student.gender,
        aadhar_no=db_student.aadhar_no,
        phone=db_student.phone,
        address=db_student.address,
        district=db_student.district,
        category=db_student.category,
        created_at=db_student.created_at,
        academic_detail=db_student.academic_detail,
        application=most_recent_application,
        documents=db_student.documents
        # Ensure schema matches (includes/excludes quota_type as needed)
    )
    return response_data

@router.post("/students/{student_id}/approve", response_model=schemas.Application)
def approve_student_application(
    student_id: int,
    verification_data: schemas.VerificationRequest,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Approve the student's STANDARD application."""
    # Assuming update_application_status finds the correct (e.g., latest EAMCET) application
    updated_application = crud.update_application_status(
        db=db,
        student_id=student_id,
        new_status=models.ApplicationStatusEnum.Approved,
        remarks=verification_data.remarks
        # Add quota_type=QuotaTypeEnum.EAMCET to crud function if it needs it to find the right app
    )
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found for this student")
    # Ensure the response schema matches the returned object (includes quota_type)
    return updated_application


@router.post("/students/{student_id}/reject", response_model=schemas.Application)
def reject_student_application(
    student_id: int,
    verification_data: schemas.VerificationRequest, # Get remarks from body
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Reject the student's application."""
    updated_application = crud.update_application_status(
        db=db,
        student_id=student_id,
        new_status=models.ApplicationStatusEnum.Rejected, # Set status to Rejected
        remarks=verification_data.remarks
    )
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found for this student")
    return updated_application


@router.get("/management-students", response_model=schemas.PaginatedManagementApplications) # Use specific paginated schema
def read_management_students(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """ Retrieve MANAGEMENT quota applications. """
    skip = (page - 1) * size
    # Call the NEW CRUD function
    total, applications = crud.get_all_management_applications(
        db, skip=skip, limit=size, search=search, status=status
    )

    items = []
    for app in applications: # Loop through ManagementApplication objects
        course_name = app.course.course_name if hasattr(app, 'course') and app.course else "N/A"
        try:
            # Use the specific Management Detail Schema
            item_detail = schemas.ManagementApplicationDetail(
                id=app.id,
                student_id=app.student_id,
                course_id=app.course_id, # Include course_id if needed in list
                status=app.status,
                submission_date=app.submission_date,
                remarks=app.remarks,
                studentName=app.student.name, # Assumes student relationship is loaded
                studentEmail=app.student.email, # Assumes student relationship is loaded
                course_name=course_name
            )
            items.append(item_detail)
        except Exception as e:
             print(f"Error mapping Management App ID {app.id}: {e}")
             continue

    return schemas.PaginatedManagementApplications(
        total=total, page=page, size=size, items=items
    )


@router.post("/management-students/{application_id}/approve", response_model=schemas.ManagementApplication)
def approve_management_application(
    application_id: int, # Use application_id from the URL
    verification_data: schemas.VerificationRequest,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """ Approve a specific management application. """
    updated_application = crud.update_management_application_status(
        db=db,
        application_id=application_id, # Pass application ID
        new_status=models.ApplicationStatusEnum.Approved,
        remarks=verification_data.remarks
    )
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Management application not found")
    return updated_application # Return the updated ManagementApplication

@router.post("/management-students/{application_id}/reject", response_model=schemas.ManagementApplication)
def reject_management_application(
    application_id: int,
    verification_data: schemas.VerificationRequest,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """ Reject a specific management application. """
    updated_application = crud.update_management_application_status(
        db=db,
        application_id=application_id,
        new_status=models.ApplicationStatusEnum.Rejected,
        remarks=verification_data.remarks
    )
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Management application not found")
    return updated_application


@router.get("/management-students/{application_id}", response_model=schemas.ManagementApplicationDetailResponse)
def read_management_student_details(
    application_id: int, # Get ID from path
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """ Get full details for a specific management application, including student info. """
    db_app = crud.get_management_application_details_by_id(db, application_id=application_id)
    if db_app is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Management application not found")

    # Map the fetched DB object (which now includes nested student/academic)
    # to the Pydantic response schema using from_orm or manual construction
    response_data = schemas.ManagementApplicationDetailResponse.from_orm(db_app)
    # Add course name separately if not handled by from_orm automatically
    if db_app.course:
        response_data.course_name = db_app.course.course_name

    return response_data