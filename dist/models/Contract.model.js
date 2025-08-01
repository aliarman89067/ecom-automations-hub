"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContractSchema = new mongoose_1.Schema({
    type: { type: String, require: true },
    html: [
        {
            key: { type: String, require: true },
            value: { type: String, require: true },
        },
    ],
});
const ContractModel = (0, mongoose_1.model)("contract", ContractSchema);
exports.default = ContractModel;
