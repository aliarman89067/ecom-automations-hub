"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
exports.transport = nodemailer_1.default.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    },
});
