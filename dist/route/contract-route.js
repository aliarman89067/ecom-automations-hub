"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lead_controller_1 = require("../controllers/lead-controller");
const router = express_1.default.Router();
router.post("/update", lead_controller_1.updateContract);
router.post("/create", lead_controller_1.createContract);
router.get("/:type", lead_controller_1.getHtml);
router.get("/client/:id", lead_controller_1.getClientContract);
router.get("/upload-url/:filename", lead_controller_1.getPresignedURL);
router.post("/send-pdf", lead_controller_1.sendPdf);
exports.default = router;
