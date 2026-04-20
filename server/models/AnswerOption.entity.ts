import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Question } from "./Question.entity";

@Entity("answer_options")
export class AnswerOption {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "question_id", type: "uuid" })
  questionId!: string;

  @Column({ name: "text", type: "text" })
  text!: string;

  @Column({ name: "is_correct", type: "boolean", default: false })
  isCorrect!: boolean;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
