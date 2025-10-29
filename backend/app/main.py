from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routes import auth , student , admin
from fastapi.staticfiles import StaticFiles
import os

# Import your routers (we will create these next)
# from .routers import auth, student, admin

# This command tells SQLAlchemy to create all the tables
# defined in models.py
models.Base.metadata.create_all(bind=engine)



app = FastAPI(
    title="TKRCET Admission Portal API",
    description="Backend for the TKRCET Admission Portal",
    version="1.0.0"
)

# Set up CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

UPLOAD_DIRECTORY_PATH = "uploads"
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY_PATH), name="uploads")


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to TKRCET Admission Portal API"}

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])