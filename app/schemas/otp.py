from pydantic import BaseModel, EmailStr


class OTPRequest(BaseModel):
    """Request OTP for login."""
    email: EmailStr


class OTPVerify(BaseModel):
    """Verify OTP and get login token."""
    email: EmailStr
    otp: str


class OTPResponse(BaseModel):
    """OTP sent response."""
    message: str
    email: str
    expires_in: int  # seconds
    otp: str | None = None  # For demo only - remove in production


class LoginResponse(BaseModel):
    """Successful login response."""
    message: str
    user_id: str
    email: str
    role: str
