import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../models/User.entity";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (userData: {
  email: string;
  password: string;
  role?: string;
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = userRepository.create({
    email: userData.email,
    password: hashedPassword,
    role: userData.role === "admin" ? UserRole.ADMIN : UserRole.STUDENT,
  });
  return await userRepository.save(user);
};

export const findUserByEmail = async (email: string) => {
  return await userRepository.findOne({ where: { email } });
};

export const findUserById = async (id: string) => {
  return await userRepository.findOne({ where: { id } });
};

export const getAllUsers = async () => {
  return await userRepository.find();
};

export const updateUser = async (id: string, data: Partial<User>) => {
  await userRepository.update(id, data);
  return await findUserById(id);
};

export const deleteUser = async (id: string) => {
  return await userRepository.delete(id);
};
