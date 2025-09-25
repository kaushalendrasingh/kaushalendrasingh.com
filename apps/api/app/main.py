from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app.config import settings
from app.database import Base, engine, get_db
from app import schemas, models, crud, deps

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="kaushalendrasingh API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# -------- Profile --------
@app.get("/profile", response_model=schemas.ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    return crud.get_profile(db)

@app.put("/profile", response_model=schemas.ProfileOut, dependencies=[Depends(deps.require_api_key)])
def update_profile(payload: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    return crud.upsert_profile(db, payload)

# -------- Projects --------
@app.get("/projects", response_model=List[schemas.ProjectOut])
def list_projects(
    tag: Optional[str] = Query(default=None),
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return crud.list_projects(db, tag=tag, limit=limit)

@app.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    proj = crud.get_project(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@app.post("/projects", response_model=schemas.ProjectOut, dependencies=[Depends(deps.require_api_key)])
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, payload)

@app.put("/projects/{project_id}", response_model=schemas.ProjectOut, dependencies=[Depends(deps.require_api_key)])
def update_project(project_id: int, payload: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    proj = crud.get_project(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.update_project(db, proj, payload)

@app.delete("/projects/{project_id}", dependencies=[Depends(deps.require_api_key)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = crud.get_project(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    crud.delete_project(db, proj)
    return {"ok": True}

# -------- Tags --------
@app.get("/tags", response_model=List[str])
def list_tags(db: Session = Depends(get_db)):
    return crud.list_tags(db)
