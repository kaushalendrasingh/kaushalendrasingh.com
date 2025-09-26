import math
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import EmailStr
from pathlib import Path
from uuid import uuid4
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, get_db
from app import schemas, models, crud, deps

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="kaushalendrasingh API", version="1.0.0")

ASSET_DIR = Path(__file__).resolve().parent / "assets"
PROJECT_ASSET_DIR = ASSET_DIR / "projects"
ASSET_DIR.mkdir(parents=True, exist_ok=True)
PROJECT_ASSET_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/assets", StaticFiles(directory=ASSET_DIR), name="assets")

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


@app.post(
    "/projects/{project_id}/assets",
    response_model=schemas.ProjectOut,
    dependencies=[Depends(deps.require_api_key)],
)
async def upload_project_assets(
    project_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = PROJECT_ASSET_DIR / str(project_id)
    project_dir.mkdir(parents=True, exist_ok=True)

    stored_paths: List[str] = []
    for file in files:
        if not file.filename:
            continue
        suffix = Path(file.filename).suffix[:20]
        filename = f"{uuid4().hex}{suffix}"
        file_path = project_dir / filename
        contents = await file.read()
        if len(contents) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50MB)")
        file_path.write_bytes(contents)
        stored_paths.append(str(Path("assets") / "projects" / str(project_id) / filename))

    if not stored_paths:
        raise HTTPException(status_code=400, detail="No files provided")

    return crud.add_project_assets(db, project, stored_paths)


@app.delete(
    "/projects/{project_id}/assets",
    response_model=schemas.ProjectOut,
    dependencies=[Depends(deps.require_api_key)],
)
def delete_project_asset(
    project_id: int,
    asset_path: str = Query(..., description="Relative asset path to remove"),
    db: Session = Depends(get_db),
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    normalized = asset_path.lstrip("/")
    absolute_path = (ASSET_DIR / Path(normalized).relative_to("assets")) if normalized.startswith("assets/") else ASSET_DIR / normalized
    if absolute_path.is_file():
        try:
            absolute_path.unlink()
        except OSError:
            pass

    return crud.remove_project_asset(db, project, normalized if normalized.startswith("assets/") else asset_path)

# -------- Tags --------
@app.get("/tags", response_model=List[str])
def list_tags(db: Session = Depends(get_db)):
    return crud.list_tags(db)


# -------- Inquiries --------
@app.post("/inquiries", response_model=schemas.InquiryOut)
async def create_inquiry(
    name: str = Form(...),
    email: EmailStr = Form(...),
    company: Optional[str] = Form(default=None),
    message: str = Form(...),
    attachment: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    attachment_path: Optional[str] = None
    if attachment and attachment.filename:
        safe_suffix = Path(attachment.filename).suffix[:10]
        filename = f"{uuid4().hex}{safe_suffix}"
        file_dir = ASSET_DIR / "inquiries"
        file_dir.mkdir(parents=True, exist_ok=True)
        file_path = file_dir / filename
        contents = await attachment.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Attachment too large (max 5MB)")
        file_path.write_bytes(contents)
        attachment_path = str(Path("assets") / "inquiries" / filename)

    payload = schemas.InquiryCreate(
        name=name,
        email=email,
        company=company or None,
        message=message,
        attachment_path=attachment_path,
    )
    return crud.create_inquiry(db, payload)


@app.get("/inquiries", response_model=schemas.InquiryListOut, dependencies=[Depends(deps.require_api_key)])
def list_inquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    items, total = crud.list_inquiries(db, search=search.strip() if search else None, offset=offset, limit=page_size)
    total_pages = math.ceil(total / page_size) if total else 0
    return schemas.InquiryListOut(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )
