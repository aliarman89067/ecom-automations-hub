// index.ts
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ContractRouter from "./route/contract-route";
import verifyRouter from "./route/verify-route";
import { generateLead } from "./controllers/lead-controller";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
  })
);

app.use("/api/v1/contract", ContractRouter);
app.use("/api/v1/verify", verifyRouter);
app.get("/test", (req, res) => {
  res.send("Hello World");
});
app.post("/generate-lead", generateLead);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!);

// 👇 Export handler for Vercel
import serverless from "serverless-http";
export const handler = serverless(app);
