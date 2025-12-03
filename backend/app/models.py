import enum
from sqlalchemy import (
    Column, Integer, String, Date, Enum, Text, TIMESTAMP, ForeignKey,
    Boolean, DECIMAL, Float, func
)
from sqlalchemy.dialects.mysql import YEAR
from sqlalchemy.orm import relationship
from .database import Base



# Define Python Enums for your SQL ENUM types
class GenderEnum(str, enum.Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"

class CategoryEnum(str, enum.Enum):
    OC = "OC"
    BC = "BC"
    SC = "SC"
    ST = "ST"
    EWS = "EWS"
    Minority = "Minority"

class ApplicationStatusEnum(str, enum.Enum):
    Pending = "Pending"
    Verified = "Verified"
    Approved = "Approved"
    Rejected = "Rejected"

class AdminRoleEnum(str, enum.Enum):
    superadmin = "superadmin"
    verifier = "verifier"
    viewer = "viewer"

class NotificationTargetEnum(str, enum.Enum):
    student = "student"
    admin = "admin"
    both = "both"


# 1. Students Table
class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_no = Column(String(20), unique=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    dob = Column(Date)
    gender = Column(Enum(GenderEnum))
    aadhar_no = Column(String(12), unique=True)
    phone = Column(String(10))
    address = Column(Text)
    district = Column(String(50))
    category = Column(Enum(CategoryEnum))
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    academic_detail = relationship("AcademicDetail", uselist=False, back_populates="student")
    applications = relationship("Application", back_populates="student")
    documents = relationship("Document", back_populates="student")
    management_applications = relationship("ManagementApplication", back_populates="student")
    

# 2. Academic Details Table
class AcademicDetail(Base):
    __tablename__ = "academic_details"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    exam_board = Column(String(100))
    hall_ticket_no = Column(String(30))
    marks_obtained = Column(Integer)
    max_marks = Column(Integer)
    percentage = Column(Float)
    passed_year = Column(YEAR)
    eamcet_hallticket = Column(String(30), nullable=True) # Add EAMCET Hall Ticket
    eamcet_rank = Column(Integer, nullable=True)
    
    # Relationship
    student = relationship("Student", back_populates="academic_detail")

# 3. Courses Table
class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_name = Column(String(100), nullable=False)
    department = Column(String(100))
    duration = Column(Integer)
    total_seats = Column(Integer)
    available_seats = Column(Integer)
    fees_per_year = Column(DECIMAL(10, 2))
    eligibility = Column(Text)

    # Relationship
    applications = relationship("Application", back_populates="course")

# 4. Applications Table
class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.Pending)
    submission_date = Column(TIMESTAMP, server_default=func.now())
    remarks = Column(Text)

    # Relationships
    student = relationship("Student", back_populates="applications")
    course = relationship("Course", back_populates="applications")

# 5. Documents Table
class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    doc_type = Column(String(100))
    file_url = Column(String(255))
    verified = Column(Boolean, default=False)
    uploaded_on = Column(TIMESTAMP, server_default=func.now())
    
    # Relationship
    student = relationship("Student", back_populates="documents")

# 6. Admins Table
class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(AdminRoleEnum), default=AdminRoleEnum.viewer)
    created_at = Column(TIMESTAMP, server_default=func.now())

# 7. Notifications Table
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255))
    message = Column(Text)
    target = Column(Enum(NotificationTargetEnum), default=NotificationTargetEnum.both)
    created_at = Column(TIMESTAMP, server_default=func.now())


class ManagementApplication(Base):
    __tablename__ = "management_applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    # Use the same status enum or define a specific one if needed
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.Pending, nullable=False)
    submission_date = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    remarks = Column(Text, nullable=True)
    # Add any other fields specific to management quota if necessary (e.g., donation_details)

    # Relationships
    student = relationship("Student", back_populates="management_applications") # New relationship name
    course = relationship("Course") # Simple relationship to Course