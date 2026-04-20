import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Quiz } from "./Quiz.entity";
import { AnswerOption } from "./AnswerOption.entity";

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "quiz_id", type: "uuid" })
  quizId!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "varchar", length: 50, default: "multiple_choice" })
  type!: string;

  @Column({ type: "int", default: 1 })
  points!: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quiz_id" })
  quiz!: Quiz;

  @OneToMany(() => AnswerOption, (option) => option.question, { cascade: true })
  options!: AnswerOption[];
}
