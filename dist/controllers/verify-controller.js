"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCode = exports.loginAdmin = exports.verifyAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
const verify_model_1 = __importDefault(require("../models/verify.model"));
const verificationEmailHTML = ({ code }) => {
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td align="center" style="padding: 30px 0;">              
             <img src="https://ecomasis.com/logo.png" alt="Logo" style="width: 150px; height:150px; object-fit: contain;" />
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
const verifyAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["ecom_asis_cms"];
        if (token) {
            res.status(200).json({ isVerify: true });
        }
        else {
            res.status(200).json({ isVerify: false });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.verifyAdmin = verifyAdmin;
function generateUnique6Digits() {
    const digits = new Set();
    while (digits.size < 6) {
        const randomDigit = Math.floor(Math.random() * 10); // 0 to 9
        digits.add(randomDigit);
    }
    return Array.from(digits).join("");
}
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const adminEmail = process.env.USER_EMAIL;
        const adminPass = process.env.ADMIN_PASS;
        if (email === adminEmail && password === adminPass) {
            const code = generateUnique6Digits();
            const newVerify = yield verify_model_1.default.create({ code, isExpired: false });
            yield utils_1.transport.sendMail({
                from: '"Ecom Automations Hub" <info@ecomautomationshub.com>',
                to: "info@ecomautomationshub.com",
                subject: `Your Verification Code`,
                html: verificationEmailHTML({ code }),
            });
            res
                .status(200)
                .json({ success: true, message: "Code sended", id: newVerify.id });
        }
        else {
            res
                .status(200)
                .json({ success: false, message: "credentials_not_valid" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.loginAdmin = loginAdmin;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, code } = req.params;
    try {
        const existingCode = yield verify_model_1.default.findById(id);
        if (!existingCode || existingCode.code !== code || existingCode.isExpired) {
            res.status(401).json({ message: "Code not found OR invalid" });
            return;
        }
        yield verify_model_1.default.findByIdAndUpdate(id, {
            isExpired: true,
        });
        const cookiePayload = {
            isVerified: true,
        };
        const token = jsonwebtoken_1.default.sign(cookiePayload, process.env.JWT_SECRET);
        res.cookie("ecom_asis_cms", token);
        res.status(201).json({ success: true, message: "Cookie created" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.verifyCode = verifyCode;
