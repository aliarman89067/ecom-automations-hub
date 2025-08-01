import express from "express";
import {
  verifyAdmin,
  loginAdmin,
  verifyCode,
} from "../controllers/verify-controller";

const router = express.Router();

router.get("/", verifyAdmin);
router.get("/:id/:code", verifyCode);
router.post("/login", loginAdmin);

export default router;
