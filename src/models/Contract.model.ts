import { model, Schema } from "mongoose";

const ContractSchema = new Schema({
  type: { type: String, require: true },
  html: [
    {
      key: { type: String, require: true },
      value: { type: String, require: true },
    },
  ],
});

const ContractModel = model("contract", ContractSchema);

export default ContractModel;
