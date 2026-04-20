import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Document } from "./Document.entity";
import { User } from "./User.entity";
import { Question } from "./Question.entity";

@Entity("quizzes")
export class Quiz {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "document_id", type: "uuid" })
  documentId!: string;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  difficulty!: string | null;

  @Column({ name: "time_limit", type: "int", nullable: true })
  timeLimit!: number | null;

  @Column({ name: "passing_score", type: "int", nullable: true })
  passingScore!: number | null;

  @Column({ name: "is_published", type: "boolean", default: false })
  isPublished!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => Document, (document) => document.quizzes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "document_id" })
  document!: Document;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions!: Question[];
}
