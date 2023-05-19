import express, { Request } from "express";
import { TokenPayload } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
import AnswerModel from "./model";
import QuestionModel from "../Questions/model";
import { SchemaTypeOptions, Types } from "mongoose";

interface TokenRequest extends Request {
  user?: TokenPayload;
}

const answersRouter = express.Router();

answersRouter.post(
  "/questions/:questionId/newAnswer",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const { body } = req.body;
    const userId = (req as TokenRequest).user!._id;
    const questionId = req.params.questionId;
    try {
      const newAnswer = new AnswerModel({
        user: userId,
        question: questionId,
        body,
      });
      await newAnswer.save();

      const question = await QuestionModel.findById(questionId);
      question!.answers.push(newAnswer._id);
      await question!.save();

      res.status(201).send(newAnswer);
    } catch (error) {
      next(error);
    }
  }
);
answersRouter.get(
  "/questions/:questionId/:answerId",
  async (req, res, next) => {
    try {
      console.log(req.params);
      const answer = await AnswerModel.findOne({
        question: req.params.questionId,
        _id: req.params.answerId,
      }).populate("user");
      if (answer === undefined) {
        res.status(404).send(undefined);
      } else {
        res.send(answer);
      }
    } catch (error) {
      next(error);
    }
  }
);
answersRouter.get("/questions/:questionId", async (req, res, next) => {
  try {
    const answers = await AnswerModel.find({
      question: req.params.questionId,
    });
    res.send(answers);
  } catch (error) {
    next(error);
  }
});

answersRouter.get("/:userId/answers", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const answers = await AnswerModel.find({ user: userId }).populate(
      "question"
    );
    res.send(answers);
  } catch (error) {
    next(error);
  }
});

answersRouter.post(
  "/:answerId/like",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const answerId = req.params.answerId;
    const userId = (req as TokenRequest).user!._id;
    try {
      const answerObjectId = new Types.ObjectId(answerId);
      const answer = await AnswerModel.findById(answerObjectId);
      if (answer!.likedBy.includes(new Types.ObjectId(userId))) {
        answer!.likedBy = answer!.likedBy.filter(
          (likedUserId) => likedUserId.toString() !== userId.toString()
        );
        answer!.noOfLikes -= 1;
        await answer!.save();
        return res.status(400).send({ answerId });
      }
      answer!.likedBy.push(new Types.ObjectId(userId));
      answer!.noOfLikes += 1;

      await answer!.save();
      res.send({ answerId });
    } catch (error) {
      next(error);
    }
  }
);

export default answersRouter;
