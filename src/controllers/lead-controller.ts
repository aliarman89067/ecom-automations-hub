import { Request, Response } from "express";
import ContractModel from "../models/Contract.model";
import ClientModel from "../models/Client.model";
import { transport } from "../utils";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_CREDENTIALS!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const htmlContent = ({
  name,
  email,
  contact,
  message,
}: {
  name: string;
  email: string;
  contact: string;
  message: string;
}) => `
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

export const generateLead = async (req: Request, res: Response) => {
  try {
    const { name, email, contact, message } = req.body;
    if (!name || !email || !contact || !message) {
      res.status(404).json({ message: "Request body is not correct" });
      return;
    }
    await transport.sendMail({
      from: '"Ecom Automations Hub" <info@ecomautomationshub.com',
      to: "info@ecomautomationshub.com",
      subject: `New Lead: ${name}`,
      html: htmlContent({ name, email, contact, message }),
    });

    res.status(201).json({ message: "Email send successfully" });
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(500).json({ message: `Something went wrong` });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  const { type, html } = req.body;

  try {
    const token = req.cookies["ecom_asis_cms"];
    if (!token) {
      throw new Error("Token not found");
    }
    let contractDoc;
    const isExisting = await ContractModel.findOne({ type });
    if (isExisting) {
      contractDoc = await ContractModel.findOneAndUpdate(
        {
          type,
        },
        {
          html,
        },
        {
          returnDocument: "after",
          returnOriginal: false,
        }
      );
    } else {
      contractDoc = await ContractModel.create({
        type,
        html,
      });
    }
    res.status(201).json(contractDoc);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createContract = async (req: Request, res: Response) => {
  const { type, html } = req.body;
  try {
    const token = req.cookies["ecom_asis_cms"];
    if (!token) {
      throw new Error("Token not found");
    }
    const newClientContract = await ClientModel.create({
      type,
      isExpired: false,
      html,
    });
    res.status(201).json({ contractId: newClientContract.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getHtml = async (req: Request, res: Response) => {
  const { type } = req.params;
  try {
    const token = req.cookies["ecom_asis_cms"];
    if (!token) {
      throw new Error("Token not found");
    }
    const existingContract = await ContractModel.findOne({
      type,
    });
    res.status(200).json(existingContract);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getClientContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingContract = await ClientModel.findById(id);
    if (!existingContract) {
      res.status(404).send(null);
      return;
    }
    if (existingContract.isExpired) {
      res.status(200).json({ isExpired: true });
    }
    res.status(200).send(existingContract);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPresignedURL = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    console.log(filename);
    const command = new PutObjectCommand({
      Bucket: "ecomasis",
      Key: filename,
      ContentType: "application/pdf",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const htmlSendPDF = ({ name, linkUrl }: { name: string; linkUrl: string }) => `
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

export const sendPdf = async (req: Request, res: Response) => {
  const { fileUrl, id } = req.body;
  try {
    await transport.sendMail({
      from: '"Ecomasis" <info@ecomasis.com>',
      to: "info@ecomasis.com",
      subject: `New Contract`,
      html: htmlSendPDF({ name: "New Contract", linkUrl: fileUrl }),
    });
    await ClientModel.findByIdAndUpdate(id, { isExpired: true }, { new: true });
    res.send("Sended");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
