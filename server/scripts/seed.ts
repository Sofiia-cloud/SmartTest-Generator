import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../models/User.entity";
import bcrypt from "bcrypt";

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to PostgreSQL");

    const userRepo = AppDataSource.getRepository(User);

    // Проверяем, есть ли уже пользователи
    const userCount = await userRepo.count();
    if (userCount > 0) {
      console.log("📊 Database already has users, skipping seed");
      process.exit(0);
    }

    // Создаем админа
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = userRepo.create({
      email: "admin@smarttest.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    // Создаем студента
    const studentPassword = await bcrypt.hash("student123", 10);
    const student = userRepo.create({
      email: "student@smarttest.com",
      password: studentPassword,
      role: UserRole.STUDENT,
      isActive: true,
    });

    await userRepo.save([admin, student]);

    console.log("✅ Database seeded!");
    console.log("📝 Admin: admin@smarttest.com / admin123");
    console.log("📝 Student: student@smarttest.com / student123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
