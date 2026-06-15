from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
from models.database import get_db
from models.schemas import UserSignup, UserLogin, UserChangePassword, UserUpdateProfile, UserResponse
from sqlalchemy import Table, Column, String, create_engine, MetaData
from sqlalchemy.sql import text
from datetime import datetime,timedelta

import jwt

SECRET_KEY="clickcartsecret"

ALGORITHM="HS256"

# Router instantiation
router = APIRouter(prefix="/auth", tags=["Authentication"])
def create_token(username, role):

    payload = {

        "sub": username,
        "role": role,

        "exp":
        datetime.utcnow()
        + timedelta(hours=12)

    }

    return jwt.encode(

        payload,

        SECRET_KEY,

        algorithm=ALGORITHM

    )

# Quick raw SQL setup for Users Table if not already mapped, to prevent database schema breaking
# This dynamically ensures a "users" table exists in SQLite for user registry!
def ensure_users_table(db: Session):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            registered_at TEXT NOT NULL
        )
    """))
    db.commit()

# --- SIGN UP CONTROLLER ---
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    ensure_users_table(db)
    
    # 1. Clean data
    username = user_data.username.strip()
    email = user_data.email.strip()
    password = user_data.password
    role = user_data.role
    
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
        
    # 2. Check if username/email already exists
    existing_user = db.execute(
        text("SELECT * FROM users WHERE username = :u OR email = :e"),
        {"u": username.lower(), "e": email.lower()}
    ).fetchone()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already in use. Please log in or choose a different username."
        )
        
    # 3. Create user
    now = datetime.utcnow().isoformat()
    db.execute(
        text("INSERT INTO users (username, email, password, role, registered_at) VALUES (:u, :e, :p, :r, :t)"),
        {"u": username, "e": email, "p": password, "r": role, "t": now}
    )
    db.commit()

    token = create_token(username, role)
    
    return {
        "username": username,
        "email": email,
        "role": role,
        "token": token,
        "registeredAt": now
    }

# --- LOGIN CONTROLLER ---
# --- LOGIN CONTROLLER ---
@router.post("/login")
def login(
login_data: UserLogin,
db: Session = Depends(get_db)
):

    ensure_users_table(db)

    input_val=(
    login_data
    .username_or_email
    .strip()
    .lower()
    )

    password=login_data.password

    user=db.execute(

    text(
    """
    SELECT *

    FROM users

    WHERE

    LOWER(username)=:i

    OR

    LOWER(email)=:i
    """
    ),

    {"i":input_val}

    ).fetchone()

    if not user:

        raise HTTPException(

        status_code=404,

        detail=
        "Account not found"

        )

    if user.password!=password:

        raise HTTPException(

        status_code=400,

        detail=
        "Incorrect password"

        )

    token= create_token(
    user.username,
    user.role
    )

    return {

    "username":
    user.username,

    "email":
    user.email,

    "role":
    user.role,

    "token":
    token,

    "registeredAt":
    user.registered_at

    }
# --- UPDATE PROFILE ---
@router.post("/update-profile", response_model=UserResponse)
def update_profile(profile_data: UserUpdateProfile, db: Session = Depends(get_db)):
    ensure_users_table(db)
    
    username = profile_data.username.strip()
    new_email = profile_data.new_email.strip()
    
    user = db.execute(
        text("SELECT * FROM users WHERE LOWER(username) = :u"),
        {"u": username.lower()}
    ).fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    db.execute(
        text("UPDATE users SET email = :e WHERE username = :u"),
        {"e": new_email, "u": user.username}
    )
    db.commit()
    
    # Fetch updated details
    updated_user = db.execute(
        text("SELECT * FROM users WHERE username = :u"),
        {"u": user.username}
    ).fetchone()
    
    token = create_token(updated_user.username, updated_user.role)

    return {
        "username": updated_user.username,
        "email": updated_user.email,
        "role": updated_user.role,
        "token": token,
        "registeredAt": updated_user.registered_at
    }

# --- CHANGE PASSWORD ---
@router.post("/change-password")
def change_password(password_data: UserChangePassword, db: Session = Depends(get_db)):
    ensure_users_table(db)
    
    username = password_data.username.strip()
    new_pwd = password_data.new_password
    
    user = db.execute(
        text("SELECT * FROM users WHERE LOWER(username) = :u"),
        {"u": username.lower()}
    ).fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    db.execute(
        text("UPDATE users SET password = :p WHERE username = :u"),
        {"p": new_pwd, "u": user.username}
    )
    db.commit()
    
    return {"success": True, "message": "Password changed successfully."}

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    ensure_users_table(db)
    rows = db.execute(text("SELECT username, email, role, registered_at FROM users")).fetchall()
    return [
        {
            "username": r.username,
            "email": r.email,
            "role": r.role,
            "registeredAt": r.registered_at
        } for r in rows
    ]
