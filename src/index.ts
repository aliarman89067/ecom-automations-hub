import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ContractRouter from "./route/contract-route";
import verifyRouter from "./route/verify-route";
import { generateLead } from "./controllers/lead-controller";
import "dotenv/config";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

console.log("Origin", process.env.CLIENT_ENDPOINT);

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

mongoose.connect(process.env.MONGO_URI!).then(() => {
  app.listen(8080, () => {
    console.log("Server is running on port 8080");
  });
});

export default app;
