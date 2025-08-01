"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const contract_route_1 = __importDefault(require("./route/contract-route"));
const verify_route_1 = __importDefault(require("./route/verify-route"));
const lead_controller_1 = require("./controllers/lead-controller");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
}));
app.use("/api/v1/contract", contract_route_1.default);
app.use("/api/v1/verify", verify_route_1.default);
app.get("/test", (req, res) => {
    res.send("Hello World");
});
app.post("/generate-lead", lead_controller_1.generateLead);
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGO_URI);
// 👇 Export handler for Vercel
const serverless_http_1 = __importDefault(require("serverless-http"));
exports.handler = (0, serverless_http_1.default)(app);
