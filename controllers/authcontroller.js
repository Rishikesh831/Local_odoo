import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateToken } from "../utils/generatetoken.js";
import { sendOTP } from "../utils/send-otp.js";
import { otpStore } from "../utils/otpStore.js";


// ==================== REGISTER ====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(name, email, password) VALUES($1, $2, $3)",
      [name, email, hashed]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==================== LOGIN (SEND OTP) ====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store in-memory with 5min expiry
    otpStore.set(email, {
      otp: otp.toString(),
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send OTP
    await sendOTP(email, otp.toString());

    res.json({
      message: "OTP sent to your email. Please verify.",
      email: email   // for frontend use
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==================== VERIFY OTP (FINAL LOGIN STEP) ====================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const entry = otpStore.get(email);

    if (!entry)
      return res.status(400).json({ message: "No OTP requested or expired" });

    if (Date.now() > entry.expiresAt)
      return res.status(400).json({ message: "OTP expired" });

    if (otp !== entry.otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP correct → issue token
    const user = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    const token = generateToken(user.rows[0].id);

    // Clear OTP from memory
    otpStore.delete(email);

    res.json({
      message: "OTP verified. Login successful.",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
