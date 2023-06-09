import express, { Request } from "express";
import UserModel from "./model";
import { TokenPayload, createAccessToken } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
import createHttpError from "http-errors";
import multer from "multer";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

interface TokenRequest extends Request {
  user?: TokenPayload;
}

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (req: Request, file: Express.Multer.File): UploadApiOptions => ({
      folder: "Capstone/users/avatars",
      public_id: (req as TokenRequest).user?.username,
    }),
  }),
}).single("avatar");

const userRouter = express.Router();
//LOGIN -- REGISTER //
userRouter.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(402).json("Username already exists");
    }
    const user = new UserModel({ username, email, password });
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

  user.online = true;
  await user.save();
  const token = await createAccessToken({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    reputation: user.reputation,
    role: user.role,
  });
  res.send({ token });
});

userRouter.post("/logout", async (req, res, next) => {
  try {
    const { userId } = req.body;
    await UserModel.findByIdAndUpdate(userId, { online: false });
    res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    next(error);
  }
});

// END OF LOGIN-REGISTER //
userRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find();
    if (users) {
      res.send(users);
    } else {
      res.send(createHttpError(404, "No users"));
    }
  } catch (error) {
    next(error);
  }
});
userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById((req as TokenRequest).user!._id);
    if (user) {
      res.send(user);
    } else {
      res.send(createHttpError(404, "User not found!"));
    }
  } catch (error) {
    next(error);
  }
});
userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.send(createHttpError(404, "User not found!"));
    }
  } catch (error) {
    next(error);
  }
});
userRouter.post(
  "/avatar",
  JWTAuthMiddleware,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const user = await UserModel.findById((req as TokenRequest).user!._id);
      if (user) {
        user.avatar = req.file?.path;
        await user.save();
        res.status(201).send(user);
      } else {
        next(createHttpError(404, "User with this id does not exist!"));
      }
    } catch (error) {
      next(error);
    }
  }
);
export default userRouter;
