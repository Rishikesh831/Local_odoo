import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User


def generate_otp(length: int = 6) -> str:
    """Generate a random 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=length))


def store_otp(db: Session, user_id: str, otp: str, expires_in_minutes: int = 10):
    """Store OTP in cache or database (using a simple approach with User model)."""
    # For now, we'll store it temporarily in memory
    # In production, use Redis or database
    return {
        "user_id": user_id,
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    }


def verify_otp(stored_otp_data: dict, provided_otp: str) -> bool:
    """Verify if provided OTP matches stored OTP and is not expired."""
    if not stored_otp_data:
        return False
    
    if datetime.utcnow() > stored_otp_data["expires_at"]:
        return False
    
    return stored_otp_data["otp"] == provided_otp


# In-memory OTP storage (replace with Redis in production)
otp_storage = {}


def save_otp_temp(user_email: str, otp: str, expires_in_minutes: int = 10):
    """Save OTP temporarily in memory."""
    otp_storage[user_email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    }


def get_otp_temp(user_email: str) -> dict | None:
    """Retrieve OTP from temporary storage."""
    return otp_storage.get(user_email)


def verify_otp_temp(user_email: str, provided_otp: str) -> bool:
    """Verify OTP from temporary storage."""
    otp_data = otp_storage.get(user_email)
    if not otp_data:
        return False
    
    if datetime.utcnow() > otp_data["expires_at"]:
        del otp_storage[user_email]
        return False
    
    if otp_data["otp"] == provided_otp:
        del otp_storage[user_email]
        return True
    
    return False


def delete_otp_temp(user_email: str):
    """Delete OTP from temporary storage."""
    if user_email in otp_storage:
        del otp_storage[user_email]
