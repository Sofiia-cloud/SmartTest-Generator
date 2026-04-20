import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Document } from "./Document.entity";
import { QuizAttempt } from "./QuizAttempt.entity";

export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "text" })
  password!: string;

  @Column({
    type: "varchar",
    length: 50,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @OneToMany(() => Document, (document) => document.user)
  documents!: Document[];

  @OneToMany(() => QuizAttempt, (attempt) => attempt.student)
  attempts!: QuizAttempt[];
}
