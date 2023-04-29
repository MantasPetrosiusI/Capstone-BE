import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { Model, Document } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  reputation: number;
  role: "User" | "Moderator" | "Administrator";
  accessToken?: string;
}

interface UserModelInterface extends Model<UserDocument> {
  checkCredentials(
    username: string,
    plainPW: string
  ): Promise<UserDocument | null>;
}

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: `https://www.maxpixel.net/static/photo/1x/Profile-Man-Symbol-Human-Communication-User-Home-42914.png `,
    },
    reputation: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["User", "Moderator", "Administrator"],
      default: "User",
    },
    accessToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  const newUserData = this;
  if (newUserData.isModified("password")) {
    const plainPw = newUserData.password;
    const hash = await bcrypt.hash(plainPw, 16);
    newUserData.password = hash;
  }
});

UserSchema.methods.toJSON = function () {
  const currentUser = this.toObject();
  delete currentUser.password;
  delete currentUser.createdAt;
  delete currentUser.updatedAt;
  delete currentUser.__v;

  return currentUser;
};

UserSchema.static("checkCredentials", async function (username, plainPW) {
  const user = await this.findOne({ username });
  if (user) {
    const passwordMatch = await bcrypt.compare(plainPW, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

const UserModel: UserModelInterface = model<UserDocument, UserModelInterface>(
  "User",
  UserSchema
);

export default UserModel;
