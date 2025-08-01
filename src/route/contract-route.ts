import express from "express";
import {
  createContract,
  updateContract,
  getHtml,
  getClientContract,
  getPresignedURL,
  sendPdf,
} from "../controllers/lead-controller";

const router = express.Router();

router.post("/update", updateContract);
router.post("/create", createContract);
router.get("/:type", getHtml);
router.get("/client/:id", getClientContract);
router.get("/upload-url/:filename", getPresignedURL);
router.post("/send-pdf", sendPdf);

export default router;
