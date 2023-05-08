import { Schema, model, Document } from "mongoose";

export interface AnswerDocument extends Document {
  user: string;
  question: string;
  body: string;
  pending: boolean;
  selected: boolean;
  rejected: boolean;
}

const AnswerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    body: { type: String, required: true },
    pending: { type: Boolean, default: true },
    selected: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AnswerModel = model<AnswerDocument>("Answer", AnswerSchema);

export default AnswerModel;
