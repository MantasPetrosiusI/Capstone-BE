import express, { Request } from "express";
import { TokenPayload } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
import QuestionModel from "./model";
import UserModel from "../Users/model";
import { Types } from "mongoose";

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
      await UserModel.findByIdAndUpdate(userId, {
        $push: { questions: newQuestion._id },
      });
      res.status(201).send(newQuestion);
    } catch (error) {
      next(error);
    }
  }
);
questionRouter.get("/", async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      let query = {};
      query = { pending: true };
      const questions = await QuestionModel.find(query)
        .populate("user")
        .populate("answers");
      res.send(questions);
    } else {
      const questions = await QuestionModel.find()
        .populate("user")
        .populate("answers");
      res.send(questions);
    }
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
questionRouter.post(
  "/:questionId/like",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const questionId = req.params.questionId;
    const userId = (req as TokenRequest).user!._id;
    const user = await UserModel.findById(userId);

    try {
      const questionObjectId = new Types.ObjectId(questionId);
      const question = await QuestionModel.findById(questionObjectId);
      if (question!.likedBy.includes(new Types.ObjectId(userId))) {
        question!.likedBy = question!.likedBy.filter(
          (likedUserId) => likedUserId.toString() !== userId.toString()
        );
        question!.noOfLikes -= 1;
        user!.reputation -= 1;
        await user!.save();
        await question!.save();
        return res.status(400).send({ questionId });
      }
      question!.likedBy.push(new Types.ObjectId(userId));
      question!.noOfLikes += 1;
      user!.reputation += 1;
      await user!.save();
      await question!.save();
      res.send({ questionId });
    } catch (error) {
      next(error);
    }
  }
);
questionRouter.get("/search", async (req, res, next) => {
  const { language, tag, title, username } = req.query;

  try {
    let searchQuery: any = {};

    if (language) {
      searchQuery.language = { $regex: language, $options: "i" };
    } else if (tag) {
      searchQuery.tags = { $regex: tag, $options: "i" };
    } else if (title) {
      searchQuery.title = { $regex: title, $options: "i" };
    } else if (username) {
      searchQuery.user = { $regex: username, $options: "i" };
    }
    let searchResults = {};
    if (language || title || tag) {
      searchResults = await QuestionModel.find(searchQuery);
    } else if (username) {
      searchResults = await UserModel.find({ username: username });
    }
    res.send(searchResults);
  } catch (error) {
    next(error);
  }
});

questionRouter.post(
  "/:questionId/status",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const questionId = req.params.questionId;
    const { status } = req.body;

    try {
      if (status === false) {
        await QuestionModel.findByIdAndDelete(questionId);
        return res.send({ message: "Question deleted" });
      } else {
        const question = await QuestionModel.findByIdAndUpdate(
          questionId,
          { accepted: status, pending: false },
          { new: true }
        ).populate("user");

        if (!question) {
          return res.status(404).send({ message: "Question not found" });
        }

        res.send(question);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default questionRouter;
