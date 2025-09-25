from sqlalchemy.orm import Session
from sqlalchemy import select
from app import models, schemas

# -------- Projects --------
def list_projects(db: Session, tag: str | None = None, limit: int | None = None):
    stmt = select(models.Project).order_by(models.Project.featured.desc(), models.Project.created_at.desc())
    if tag:
        # filter projects whose tags include the given tag
        stmt = stmt.filter(models.Project.tags.any(tag))
    if limit:
        stmt = stmt.limit(limit)
    return db.execute(stmt).scalars().all()

def get_project(db: Session, project_id: int):
    return db.get(models.Project, project_id)

def create_project(db: Session, data: schemas.ProjectCreate):
    obj = models.Project(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_project(db: Session, project: models.Project, data: schemas.ProjectUpdate):
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(project, k, v)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project: models.Project):
    db.delete(project)
    db.commit()

# -------- Profile --------
def get_profile(db: Session):
    # single row profile (id=1), create if missing
    p = db.get(models.Profile, 1)
    if not p:
        p = models.Profile(
            id=1,
            name="Kaushalendra Singh",
            headline="Full‑Stack Developer · React + FastAPI",
            bio="I build clean, fast, and scalable products. This portfolio is powered by FastAPI + Postgres + React.",
            skills=["React", "TypeScript", "Tailwind", "FastAPI", "PostgreSQL"],
            github="https://github.com/kaushalendrasingh",
            linkedin="https://www.linkedin.com/in/kaushalendra-singh/",
            website="https://kaushcodes.com"
        )
        db.add(p)
        db.commit()
        db.refresh(p)
    return p

def upsert_profile(db: Session, data: schemas.ProfileUpdate):
    p = get_profile(db)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def list_tags(db: Session):
    rows = db.execute(select(models.Project.tags)).all()
    tags = set()
    for (arr,) in rows:
        if arr:
            for t in arr:
                tags.add(t)
    return sorted(tags)


# -------- Inquiries --------
def create_inquiry(db: Session, data: schemas.InquiryCreate):
    inquiry = models.Inquiry(**data.model_dump())
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


def list_inquiries(db: Session):
    stmt = select(models.Inquiry).order_by(models.Inquiry.created_at.desc())
    return db.execute(stmt).scalars().all()
