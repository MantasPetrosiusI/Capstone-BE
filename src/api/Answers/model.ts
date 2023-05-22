import { Schema, model, Document, Types } from "mongoose";

export interface AnswerDocument extends Document {
  user: Types.ObjectId;
  question: Types.ObjectId;
  likedBy: Types.ObjectId[];
  noOfLikes: number;
  body: string;
  pending: boolean;
  accepted: boolean;
}

const AnswerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    noOfLikes: { type: Number, default: 0 },
    body: { type: String, required: true },
    pending: { type: Boolean, default: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AnswerModel = model<AnswerDocument>("Answer", AnswerSchema);

export default AnswerModel;
