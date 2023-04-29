import express, { Request } from "express";
import UserModel from "./model";
import { TokenPayload, createAccessToken } from "../lib/auth/tools";
import { JWTAuthMiddleware } from "../lib/auth/jwt";

interface TokenRequest extends Request {
  user?: TokenPayload;
}

const userRouter = express.Router();
//LOGIN -- REGISTER -- LOGOUT //
userRouter.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(402).json("Username already exists");
    }
    const user = new UserModel({ username, email, password });
    console.log(user);
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const user = await UserModel.checkCredentials(username, password);
  if (!user) {
    return next({ status: 500, message: "Username or password is incorrect" });
  }

  const token = await createAccessToken({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    reputation: user.reputation,
    role: user.role,
  });
  res.send({ token });
});

// END OF LOGIN-REGISTER-LOGOUT //

export default userRouter;
