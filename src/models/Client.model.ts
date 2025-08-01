import { model, Schema } from "mongoose";

const ClientSchema = new Schema({
  type: { type: String, require: true },
  isExpired: { type: Boolean, require: true },
  html: [
    {
      key: { type: String, require: true },
      value: { type: String, require: true },
    },
  ],
});

const ClientModel = model("client", ClientSchema);

export default ClientModel;
