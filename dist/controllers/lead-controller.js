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
exports.sendPdf = exports.getPresignedURL = exports.getClientContract = exports.getHtml = exports.createContract = exports.updateContract = exports.generateLead = void 0;
const Contract_model_1 = __importDefault(require("../models/Contract.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const utils_1 = require("../utils");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_CREDENTIALS,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const htmlContent = ({ name, email, contact, message, }) => `
  <div style="font-family: 'Segoe UI', sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">New Lead Notification</h2>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px;">You have received a new lead with the following details:</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; font-weight: bold; background-color: #f9f9f9; width: 30%;">Name:</td>
          <td style="padding: 10px;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background-color: #f9f9f9;">Email:</td>
          <td style="padding: 10px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background-color: #f9f9f9;">Contact:</td>
          <td style="padding: 10px;">${contact}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background-color: #f9f9f9;">Message:</td>
          <td style="padding: 10px;">${message}</td>
        </tr>
      </table>

    </div>
  </div>
`;
const generateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, contact, message } = req.body;
        if (!name || !email || !contact || !message) {
            res.status(404).json({ message: "Request body is not correct" });
            return;
        }
        yield utils_1.transport.sendMail({
            from: '"Ecom Automations Hub" <info@ecomautomationshub.com>',
            to: "info@ecomautomationshub.com",
            subject: `New Lead: ${name}`,
            html: htmlContent({ name, email, contact, message }),
        });
        res.status(201).json({ message: "Email send successfully" });
    }
    catch (error) {
        console.log(error);
        console.log(error);
        res.status(500).json({ message: `Something went wrong` });
    }
});
exports.generateLead = generateLead;
const updateContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, html } = req.body;
    try {
        const token = req.cookies["ecom_asis_cms"];
        if (!token) {
            throw new Error("Token not found");
        }
        let contractDoc;
        const isExisting = yield Contract_model_1.default.findOne({ type });
        if (isExisting) {
            contractDoc = yield Contract_model_1.default.findOneAndUpdate({
                type,
            }, {
                html,
            }, {
                returnDocument: "after",
                returnOriginal: false,
            });
        }
        else {
            contractDoc = yield Contract_model_1.default.create({
                type,
                html,
            });
        }
        res.status(201).json(contractDoc);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateContract = updateContract;
const createContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, html } = req.body;
    try {
        const token = req.cookies["ecom_asis_cms"];
        if (!token) {
            throw new Error("Token not found");
        }
        const newClientContract = yield Client_model_1.default.create({
            type,
            isExpired: false,
            html,
        });
        res.status(201).json({ contractId: newClientContract.id });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createContract = createContract;
const getHtml = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.params;
    try {
        const token = req.cookies["ecom_asis_cms"];
        if (!token) {
            throw new Error("Token not found");
        }
        const existingContract = yield Contract_model_1.default.findOne({
            type,
        });
        res.status(200).json(existingContract);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getHtml = getHtml;
const getClientContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existingContract = yield Client_model_1.default.findById(id);
        if (!existingContract) {
            res.status(404).send(null);
            return;
        }
        if (existingContract.isExpired) {
            res.status(200).json({ isExpired: true });
        }
        res.status(200).send(existingContract);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getClientContract = getClientContract;
const getPresignedURL = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.params;
        console.log(filename);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: "ecomasis",
            Key: filename,
            ContentType: "application/pdf",
        });
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 300 });
        res.json({ url });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getPresignedURL = getPresignedURL;
const htmlSendPDF = ({ name, linkUrl }) => `
  <div style="font-family: 'Segoe UI', sans-serif; color: #333; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">Hello, ${name}</h2>
    </div>
    <div style="padding: 30px; text-align: center;">
      <a 
        href="${linkUrl}" 
        target="_blank" 
        style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Download Contract PDF
      </a>
    </div>
  </div>
`;
const sendPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileUrl, id } = req.body;
    try {
        yield utils_1.transport.sendMail({
            from: '"Ecomasis" <info@ecomasis.com>',
            to: "info@ecomasis.com",
            subject: `New Contract`,
            html: htmlSendPDF({ name: "New Contract", linkUrl: fileUrl }),
        });
        yield Client_model_1.default.findByIdAndUpdate(id, { isExpired: true }, { new: true });
        res.send("Sended");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.sendPdf = sendPdf;
