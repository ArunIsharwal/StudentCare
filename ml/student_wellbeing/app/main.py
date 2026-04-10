from fastapi import FastAPI
from student_wellbeing.app.routes import stress

app = FastAPI(title="Student Wellbeing API", version="1.0.0")

app.include_router(stress.router, prefix="/api/student-wellbeing")

@app.get("/")
def read_root():
    return {"message": "Welcome to Student Wellbeing API"}
