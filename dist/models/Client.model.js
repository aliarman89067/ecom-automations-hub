"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    type: { type: String, require: true },
    isExpired: { type: Boolean, require: true },
    html: [
        {
            key: { type: String, require: true },
            value: { type: String, require: true },
        },
    ],
});
const ClientModel = (0, mongoose_1.model)("client", ClientSchema);
exports.default = ClientModel;
