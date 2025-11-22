// OTP store in memory (auto-clears on server restart)
export const otpStore = new Map();

// Structure: 
// otpStore.set(email, { otp: "123456", expiresAt: Date })
