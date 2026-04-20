import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Quiz } from "./Quiz.entity";
import { User } from "./User.entity";

@Entity("quiz_attempts")
export class QuizAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "quiz_id", type: "uuid" })
  quizId!: string;

  @Column({ name: "student_id", type: "uuid" })
  studentId!: string;

  @Column({ type: "int", nullable: true })
  score!: number | null;

  @Column({ type: "boolean", nullable: true })
  passed!: boolean | null;

  @Column({ type: "jsonb", nullable: true })
  answers!: Record<string, any> | null;

  @CreateDateColumn({ name: "started_at", type: "timestamp" })
  startedAt!: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt!: Date | null;

  @ManyToOne(() => Quiz, (quiz) => quiz.attempts)
  @JoinColumn({ name: "quiz_id" })
  quiz!: Quiz;

  @ManyToOne(() => User, (user) => user.attempts)
  @JoinColumn({ name: "student_id" })
  student!: User;
}
