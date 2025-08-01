"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VerifySchema = new mongoose_1.Schema({
    code: { type: String, require: true },
    isExpired: { type: Boolean, require: true },
});
const VerifyModel = (0, mongoose_1.model)("verify", VerifySchema);
exports.default = VerifyModel;
