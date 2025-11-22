from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.otp import OTPRequest, OTPVerify, OTPResponse, LoginResponse
from app.utils.otp import generate_otp, save_otp_temp, verify_otp_temp
from app.utils.auth import hash_password
from app.utils.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=OTPResponse)
def login(email: str, password: str, db: Session = Depends(get_db)):
    """
    Step 1: Login with email and password.
    If credentials are correct, generate and send OTP via email (valid for 10 minutes).
    """
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    stored_hash = user.hashed_password
    provided_hash = hash_password(password)
    
    if stored_hash != provided_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Password correct! Generate OTP
    otp = generate_otp()
    save_otp_temp(email, otp, expires_in_minutes=10)

    # Send OTP via email
    email_sent = send_otp_email(email, otp)
    
    if email_sent:
        message = f"Password correct! OTP sent to {email}."
    else:
        message = f"Password correct! OTP: {otp} (Email service not configured)"

    return OTPResponse(
        message=message,
        email=email,
        expires_in=600,  # 10 minutes in seconds
        otp=otp if not email_sent else None  # Only return OTP if email failed
    )


@router.post("/verify-otp", response_model=LoginResponse)
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    """
    Step 2: Verify OTP to complete 2FA login.
    """
    # Verify OTP
    if not verify_otp_temp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please login again."
        )

    # Get user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # In production, generate JWT token here
    # token = create_access_token(user.id)
    
    return LoginResponse(
        message="2FA verified! Login successful!",
        user_id=str(user.id),
        email=str(user.email),
        role=user.role.value
    )


@router.post("/request-otp", response_model=OTPResponse)
def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """
    Alternative: Request OTP directly (without password).
    Check if user exists, send OTP via email.
    """
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )

    # Generate OTP
    otp = generate_otp()
    save_otp_temp(request.email, otp, expires_in_minutes=10)

    # Send OTP via email
    email_sent = send_otp_email(request.email, otp)
    
    if email_sent:
        message = f"OTP sent to {request.email}."
    else:
        message = f"OTP: {otp} (Email service not configured)"

    return OTPResponse(
        message=message,
        email=request.email,
        expires_in=600,
        otp=otp if not email_sent else None  # Only return OTP if email failed
    )
