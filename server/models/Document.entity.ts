import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Quiz } from "./Quiz.entity";

@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "file_path", type: "text" })
  filePath!: string;

  @Column({ name: "extracted_text", type: "text", nullable: true })
  extractedText!: string | null;

  @CreateDateColumn({ name: "uploaded_at", type: "timestamp" })
  uploadedAt!: Date;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Quiz, (quiz) => quiz.document)
  quizzes!: Quiz[];
}
