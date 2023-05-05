import { Schema, model, Document } from "mongoose";

export interface QuestionDocument extends Document {
  title: string;
  description: string;
  language: string;
  tags: string[];
  user: string;
}

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    tags: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const QuestionModel = model<QuestionDocument>("Question", QuestionSchema);

export default QuestionModel;
