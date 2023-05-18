import jwt, { Secret } from "jsonwebtoken";

export interface TokenPayload {
  _id: string;
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
      process.env.JWT_SECRET! as Secret,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    )
  );

export const verifyAccessToken = (token: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET! as Secret, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as TokenPayload);
    })
  );
