import express, { Request } from "express";
import { TokenPayload } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
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
questionRouter.get("/", async (req, res, next) => {
  try {
    const allQuestions = await QuestionModel.find().populate("user");
    res.send(allQuestions);
  } catch (error) {
    next(error);
  }
});
questionRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  const userId = (req as TokenRequest).user!._id;

  try {
    const userQuestions = await QuestionModel.find({ user: userId });
    res.send(userQuestions);
  } catch (error) {
    next(error);
  }
});

questionRouter.get("/search", async (req, res, next) => {
  const { language, tag, title } = req.query;

  try {
    let searchQuery: any = {};

    if (language) {
      searchQuery.language = language;
    } else if (tag) {
      searchQuery.tags = tag;
    } else if (title) {
      searchQuery.title = { $regex: title, $options: "i" };
    }

    const searchResults = await QuestionModel.find(searchQuery);
    res.send(searchResults);
  } catch (error) {
    next(error);
  }
});

export default questionRouter;
