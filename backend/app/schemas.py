from pydantic import BaseModel, EmailStr 
from typing import Optional , List
from datetime import date
from .models import GenderEnum, CategoryEnum ,ApplicationStatusEnum # Import your enums
from datetime import datetime


# --- Academic Detail Schemas ---
class AcademicDetailBase(BaseModel):
    exam_board: Optional[str] = None
    hall_ticket_no: Optional[str] = None
    marks_obtained: Optional[int] = None
    max_marks: Optional[int] = None
    percentage: Optional[float] = None
    passed_year: Optional[int] = None
    eamcet_hallticket: Optional[str] = None
    eamcet_rank: Optional[int] = None

class AcademicDetailCreate(AcademicDetailBase):
    pass

class AcademicDetail(AcademicDetailBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentBase(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[date] = None
    gender: Optional[GenderEnum] = None
    aadhar_no: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    category: Optional[CategoryEnum] = None

# Schema for creating a new student (Registration)
class StudentCreate(StudentBase):
    password: str
    academic_details: AcademicDetailCreate # Nested schema

# Schema for reading a student (API Response)
class Student(StudentBase):
    id: int
    application_no: str
    academic_detail: Optional[AcademicDetail] = None

    class Config:
        from_attributes = True # <-- NEW

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Document(BaseModel):
    id: int
    student_id: int
    doc_type: str
    file_url: str
    verified: bool
    uploaded_on: datetime

    class Config:
        from_attributes = True


class StudentApplicationDetail(BaseModel):
    id: int # Application ID
    student_id: int
    branch: Optional[str] = None # Assuming branch is stored directly or fetched
    submission_date: datetime
    status: ApplicationStatusEnum # Use the enum we defined before
    studentName: str
    studentEmail: EmailStr
    
    class Config:
        from_attributes = True

# We also need a schema for the API response which might include pagination info
class PaginatedStudentApplications(BaseModel):
    total: int
    page: int
    size: int
    items: List[StudentApplicationDetail]



class AcademicDetailUpdate(BaseModel):
    exam_board: Optional[str] = None
    hall_ticket_no: Optional[str] = None
    marks_obtained: Optional[int] = None
    max_marks: Optional[int] = None
    percentage: Optional[float] = None
    passed_year: Optional[int] = None

# --- Schema for updating Student Details (Optional fields) ---
class StudentUpdate(BaseModel):
    name: Optional[str] = None
    # email: Optional[EmailStr] = None # Usually email shouldn't be editable easily
    dob: Optional[date] = None
    gender: Optional[GenderEnum] = None
    aadhar_no: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    category: Optional[CategoryEnum] = None
    
    # Nested update schema for academic details
    academic_detail: Optional[AcademicDetailUpdate] = None


class ApplicationCreate(BaseModel):
    course_id: int
    

# --- Schema for listing courses (if not already defined) ---
class CourseBase(BaseModel):
    id: int
    course_name: str
    department: str

class Course(CourseBase):
    duration: Optional[int] = None
    total_seats: Optional[int] = None
    fees_per_year: Optional[float] = None # Use float for Pydantic

    class Config:
        from_attributes = True

# --- Schema for the application response ---
class Application(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: ApplicationStatusEnum
    submission_date: datetime
    remarks: Optional[str] = None
    

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    course_name: str
    department: Optional[str] = None
    duration: Optional[int] = None
    total_seats: Optional[int] = None
    fees_per_year: Optional[float] = None
    eligibility: Optional[str] = None

# --- Schema for UPDATING a course (all fields optional) ---
class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    department: Optional[str] = None
    duration: Optional[int] = None
    total_seats: Optional[int] = None
    available_seats: Optional[int] = None # Admin might adjust this
    fees_per_year: Optional[float] = None
    eligibility: Optional[str] = None


class ApplicationStatusResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: ApplicationStatusEnum
    submission_date: datetime
    remarks: Optional[str] = None
    course_name: Optional[str] = None # Add course name
    

    class Config:
        from_attributes = True

class StudentDetailResponse(BaseModel):
    # From Student model
    id: int
    application_no: str
    name: str
    email: EmailStr
    dob: Optional[date] = None
    gender: Optional[GenderEnum] = None
    aadhar_no: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    category: Optional[CategoryEnum] = None
    created_at: datetime

    # From AcademicDetail model (nested)
    academic_detail: Optional[AcademicDetail] = None # Reuse existing schema

    # From Application model (assuming one application per student for now)
    application: Optional[Application] = None # Reuse existing schema

    # List of Documents
    documents: List[Document] = [] # Reuse existing Document schema

    class Config:
        from_attributes = True

# --- Schema for the remarks payload ---
class VerificationRequest(BaseModel):
    remarks: str

class ManagementApplicationCreate(BaseModel):
    course_id: int

# Base for response data
class ManagementApplicationBase(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: ApplicationStatusEnum # Reuse enum
    submission_date: datetime
    remarks: Optional[str] = None

# Full response including relationships (if needed)
class ManagementApplication(ManagementApplicationBase):
    course_name: Optional[str] = None # Example: Add course name

    class Config:
        from_attributes = True

# Schema for the admin list view
class ManagementApplicationDetail(ManagementApplicationBase):
    studentName: str
    studentEmail: EmailStr
    course_name: Optional[str] = None # Example: Add course name

    class Config:
        from_attributes = True

# Schema for paginated admin list view
class PaginatedManagementApplications(BaseModel):
    total: int
    page: int
    size: int
    items: List[ManagementApplicationDetail]

class ManagementApplicationDetailResponse(ManagementApplicationBase): # Inherits from base Mgmt App schema
    student: Optional[Student] = None # Include full student details (which includes academic)
    course_name: Optional[str] = None

    class Config:
        from_attributes = True