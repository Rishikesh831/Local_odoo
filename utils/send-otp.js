import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOTP = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Inventory App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  });
};
