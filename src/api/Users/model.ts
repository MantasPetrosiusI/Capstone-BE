import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { Model, Document } from "mongoose";

export interface UserDocument extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  reputation: number;
  role: "User" | "Moderator" | "Administrator";
  accessToken?: string;
  online: boolean;
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
      default: `https://res.cloudinary.com/dlfkpg7my/image/upload/v1683029682/Capstone/Sample_User_Icon_js0pbj.png`,
    },
    reputation: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["User", "Moderator", "Administrator"],
      default: "User",
    },
    accessToken: { type: String },
    online: { type: Boolean, default: false },
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
