import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { transport } from "../utils";
import VerifyModel from "../models/verify.model";

const verificationEmailHTML = ({ code }: { code: string }) => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td align="center" style="padding: 30px 0;">              
             <img src="https://ecomautomationshub.com/logo.png" alt="Logo" style="width: 150px; height:150px; object-fit: contain;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <h2 style="color: #333333;">Verify Your Email Address</h2>
              <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                Thank you for signing up. Please use the verification code below to complete your registration.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #f0f0f0; color: #111111; font-size: 24px; letter-spacing: 4px; padding: 15px 25px; border-radius: 6px; font-weight: bold;">
                  ${code}
                </span>
              </div>
              <p style="font-size: 14px; color: #999999;">
                This code will expire in 10 minutes. If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px 40px; text-align: center;">
              <p style="font-size: 12px; color: #aaaaaa;">
                &copy; ${new Date().getFullYear()} Ecom Asis. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
};

export const verifyAdmin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies["ecom_asis_cms"];
    if (token) {
      res.status(200).json({ isVerify: true });
    } else {
      res.status(200).json({ isVerify: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

function generateUnique6Digits() {
  const digits = new Set();

  while (digits.size < 6) {
    const randomDigit = Math.floor(Math.random() * 10); // 0 to 9
    digits.add(randomDigit);
  }

  return Array.from(digits).join("");
}

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const adminEmail = process.env.USER_EMAIL!;
    const adminPass = process.env.ADMIN_PASS!;
    if (email === adminEmail && password === adminPass) {
      const code = generateUnique6Digits();
      const newVerify = await VerifyModel.create({ code, isExpired: false });
      await transport.sendMail({
        from: '"Ecom Automations Hub" <info@ecomautomationshub.com>',
        to: "info@ecomautomationshub.com",
        subject: `Your Verification Code`,
        html: verificationEmailHTML({ code }),
      });
      res
        .status(200)
        .json({ success: true, message: "Code sended", id: newVerify.id });
    } else {
      res
        .status(200)
        .json({ success: false, message: "credentials_not_valid" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { id, code } = req.params;
  try {
    const existingCode = await VerifyModel.findById(id);
    if (!existingCode || existingCode.code !== code || existingCode.isExpired) {
      res.status(401).json({ message: "Code not found OR invalid" });
      return;
    }
    await VerifyModel.findByIdAndUpdate(id, {
      isExpired: true,
    });
    const cookiePayload = {
      isVerified: true,
    };
    const token = jwt.sign(cookiePayload, process.env.JWT_SECRET!);
    res.cookie("ecom_asis_cms", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 1,
    });
    res.status(201).json({ success: true, message: "Cookie created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
