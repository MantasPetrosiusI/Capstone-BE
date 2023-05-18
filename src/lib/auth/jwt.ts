import createHttpError from "http-errors";
import { RequestHandler, Request } from "express";
import { verifyAccessToken, TokenPayload } from "./tools";

export interface UserRequest extends Request {
  user?: TokenPayload; // Make the user property optional
}

export const JWTAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw createHttpError(
        401,
        "Please provide a Bearer token in the authorization header"
      );
    }

    const accessToken = req.headers.authorization.replace("Bearer ", "");
    const payload = await verifyAccessToken(accessToken);

    req.user = {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
      avatar: payload.avatar,
      reputation: payload.reputation,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      next(createHttpError(401, "Invalid token. Please log in again."));
    } else {
      next(createHttpError(500, "Internal server error"));
    }
  }
};
