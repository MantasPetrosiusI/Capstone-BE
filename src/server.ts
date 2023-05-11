import Express from "express";
import cors from "cors";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
  validationErrorHandler,
} from "./errorHandlers";
import passport from "passport";
import userRouter from "./api/Users";
import questionRouter from "./api/Questions";
import answersRouter from "./api/Answers";

const server = Express();

server.use(cors());
server.use(Express.json());
server.use(passport.initialize());

server.use("/users", questionRouter);
server.use("/users", userRouter);
server.use("/users", answersRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);

server.use(validationErrorHandler);
server.use(genericErrorHandler);

export default server;
