import express, { Request } from "express";
import UserModel from "./model";
import { TokenPayload } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
import createHttpError from "http-errors";
import QuestionModel from "./model";

interface TokenRequest extends Request {
  user?: TokenPayload;
}

const questionRouter = express.Router();

questionRouter.post(
  "/me/newQuestion",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const { title, description, language, tags } = req.body;
    const userId = (req as TokenRequest).user!._id;

    try {
      const newQuestion = new QuestionModel({
        title,
        description,
        language,
        tags,
        user: userId,
      });
      await newQuestion.save();

      res.status(201).send(newQuestion);
    } catch (error) {
      next(error);
    }
  }
);
questionRouter.get("/questions", async (req, res, next) => {
  try {
    const allQuestions = await QuestionModel.find();
    res.send(allQuestions);
  } catch (error) {
    next(error);
  }
});
questionRouter.get(
  "/me/questions",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const userId = (req as TokenRequest).user!._id;

    try {
      const userQuestions = await QuestionModel.find({ user: userId });
      res.send(userQuestions);
    } catch (error) {
      next(error);
    }
  }
);

export default questionRouter;
