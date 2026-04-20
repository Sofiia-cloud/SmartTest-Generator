import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User.entity";
import { Document } from "../models/Document.entity";
import { Quiz } from "../models/Quiz.entity";
import { Question } from "../models/Question.entity";
import { AnswerOption } from "../models/AnswerOption.entity";
import { QuizAttempt } from "../models/QuizAttempt.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "smarttest_db",
  synchronize: true,
  logging: true,
  entities: [User, Document, Quiz, Question, AnswerOption, QuizAttempt],
});
