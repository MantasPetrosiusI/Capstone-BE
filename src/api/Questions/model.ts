import { Schema, model, Document, Types } from "mongoose";

export interface QuestionDocument extends Document {
  title: string;
  description: string;
  language: string;
  tags: string[];
  user: Types.ObjectId;
  answered: boolean;
  noOfLikes: number;
  likedBy: Types.ObjectId[];
  answers: Types.Array<Types.ObjectId>;
  pending: boolean;
  accepted: boolean;
}

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    tags: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answered: { type: Boolean, default: false },
    noOfLikes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    pending: { type: Boolean, default: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuestionModel = model<QuestionDocument>("Question", QuestionSchema);

export default QuestionModel;
