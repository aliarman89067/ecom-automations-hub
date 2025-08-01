"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verify_controller_1 = require("../controllers/verify-controller");
const router = express_1.default.Router();
router.get("/", verify_controller_1.verifyAdmin);
router.get("/:id/:code", verify_controller_1.verifyCode);
router.post("/login", verify_controller_1.loginAdmin);
exports.default = router;
