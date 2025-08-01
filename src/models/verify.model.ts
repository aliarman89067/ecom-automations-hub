import { Schema, model } from "mongoose";

const VerifySchema = new Schema({
  code: { type: String, require: true },
  isExpired: { type: Boolean, require: true },
});

const VerifyModel = model("verify", VerifySchema);

export default VerifyModel;
