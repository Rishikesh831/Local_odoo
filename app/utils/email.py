from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.config import get_settings


def send_otp_email(recipient_email: str, otp: str) -> bool:
    """
    Send OTP via email using SendGrid.
    
    Args:
        recipient_email: Email to send OTP to
        otp: The OTP code
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        settings = get_settings()
        
        # Check if API key is configured
        if not settings.sendgrid_api_key or settings.sendgrid_api_key == "your_sendgrid_api_key_here":
            print(f"⚠️  SendGrid not configured. OTP for {recipient_email}: {otp}")
            return False
        
        message = Mail(
            from_email=settings.sendgrid_from_email,
            to_emails=recipient_email,
            subject="StockMaster 2FA OTP Code",
            html_content=f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Your 2FA OTP Code</h2>
                    <p>Hello,</p>
                    <p>Your one-time password (OTP) for StockMaster login is:</p>
                    <h1 style="color: #007bff; letter-spacing: 5px;">{otp}</h1>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr>
                    <p style="color: #999; font-size: 12px;">StockMaster - Inventory Management System</p>
                </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        response = sg.send(message)
        
        return response.status_code == 202
    
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False
