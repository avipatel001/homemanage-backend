import mongoose, { Schema } from "mongoose";

const entrySchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: Number, required: true },
  description: { type: String },
});

export const Entry = mongoose.model("Entry", entrySchema);
