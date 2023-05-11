import express, { Request } from "express";
import { TokenPayload } from "../../lib/auth/tools";
import { JWTAuthMiddleware } from "../../lib/auth/jwt";
import AnswerModel from "./model";
import QuestionModel from "../Questions/model";

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
      console.log(req.params.questionId);
      console.log(req.params.answerId);
      const answer = await AnswerModel.findOne({
        question: req.params.questionId,
        _id: req.params.answerId,
      }).populate("user");
      console.log(answer);

      res.send(answer);
    } catch (error) {
      next(error);
    }
  }
);
answersRouter.get("/questions/:questionId", async (req, res, next) => {
  try {
    console.log(req.params.questionId);
    const answers = await AnswerModel.find({
      question: req.params.questionId,
    });
    console.log(answers);

    res.send(answers);
  } catch (error) {
    next(error);
  }
});

export default answersRouter;
