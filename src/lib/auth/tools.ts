import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export interface TokenPayload {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  role: "User" | "Moderator" | "Administrator";
}

export const createAccessToken = (payload: TokenPayload): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    )
  );

export const verifyAccessToken = (token: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as TokenPayload);
    })
  );
