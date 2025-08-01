import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL!,
    pass: process.env.USER_PASS!,
  },
});
