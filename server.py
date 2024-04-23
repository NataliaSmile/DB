from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from pathlib import Path
from fastapi.staticfiles import StaticFiles


DATABASE_URL = "sqlite:///./db/database.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Word(BaseModel):
    name: str
    description: str
    level: str
    characteristic: str

class WordModel(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    level = Column(String)
    characteristic= Column (String)

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_sql_query(level: str, char: str, search: str):
    arr = [
        f"level = '{level}'" if level else None,
        f"characteristic = '{char}'" if char else None,
        f"name LIKE '%{search}%'" if search else None
    ]
    filtered_array = [item for item in arr if item is not None]
    res = " AND ".join(filtered_array)
    return  f"SELECT * FROM words{' WHERE ' + res if len(res) > 0 else ''} ORDER BY name ASC"

@app.get("/words/")
def read_words(db: Session = Depends(get_db), level: str = None, char: str = None, search: str = None):
    sql = create_sql_query(level, char, search)
    result = db.execute(sql)
    response = []
    for row in result:
        response.append(row)
    return response

@app.get("/words/levels/")
def read_levels(db: Session = Depends(get_db)):
    result = db.execute("SELECT DISTINCT level FROM words")
    levels = [row[0] for row in result]
    return levels

@app.get("/words/characteristics/")
def read_characteristics(db: Session = Depends(get_db)):
    result = db.execute("SELECT DISTINCT characteristic FROM words")
    characteristics = [row[0] for row in result]
    return characteristics

static_dir = Path(__file__).parent / "public"
app.mount("/", StaticFiles (directory="public", html=True), name="public")