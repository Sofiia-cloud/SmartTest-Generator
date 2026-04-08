import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserService from '../services/userService';
import User from '../models/User';
import DocumentModel from '../models/Document';
import QuizModel from '../models/Quiz';
import { ROLES } from 'shared';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Connect to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost/DocQuizAI';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - uncomment to preserve data)
    await User.deleteMany({});
    await DocumentModel.deleteMany({});
    await QuizModel.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const adminEmail = 'admin@docquiz.com';
    const adminPassword = 'Admin@123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await UserService.create({
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
      });
      console.log(`✓ Created admin user: ${adminEmail}`);
    } else {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
    }

    // Create student users
    const studentEmails = [
      { email: 'student1@docquiz.com', password: 'Student@123456' },
      { email: 'student2@docquiz.com', password: 'Student@123456' },
    ];

    for (const student of studentEmails) {
      let studentUser = await User.findOne({ email: student.email });
      if (!studentUser) {
        studentUser = await UserService.create({
          email: student.email,
          password: student.password,
          role: ROLES.STUDENT,
        });
        console.log(`✓ Created student user: ${student.email}`);
      } else {
        console.log(`✓ Student user already exists: ${student.email}`);
      }
    }

    // Create sample documents
    const adminUserId = adminUser._id.toString();
    console.log(`Admin user ID: ${adminUserId}`);

    const sampleDocuments = [
      {
        fileName: 'AWS Cloud Practitioner Guide.pdf',
        fileSize: 2457600,
        userId: adminUserId,
        content: `AWS Cloud Fundamentals

This guide covers the basics of Amazon Web Services (AWS).

Key Topics:
1. AWS Global Infrastructure
   - Regions and Availability Zones
   - Edge Locations
   - Global Accelerator

2. Core Services
   - EC2: Elastic Compute Cloud
   - S3: Simple Storage Service
   - RDS: Relational Database Service
   - Lambda: Serverless Computing

3. Security and Compliance
   - IAM: Identity and Access Management
   - VPC: Virtual Private Cloud
   - Security Groups and NACLs
   - KMS: Key Management Service

4. Pricing Models
   - On-Demand Instances
   - Reserved Instances
   - Spot Instances
   - Savings Plans

5. Well-Architected Framework
   - Operational Excellence
   - Security
   - Reliability
   - Performance Efficiency
   - Cost Optimization`,
        status: 'ready',
        quizCount: 0,
      },
      {
        fileName: 'JavaScript Fundamentals.pdf',
        fileSize: 1843200,
        userId: adminUserId,
        content: `JavaScript Programming Basics

Introduction to JavaScript
JavaScript is a versatile programming language used for web development.

Core Concepts:
1. Variables and Data Types
   - var, let, const
   - Primitive types
   - Objects and arrays

2. Functions
   - Function declarations
   - Arrow functions
   - Callbacks
   - Promises
   - Async/Await

3. Object-Oriented Programming
   - Prototypes
   - Classes
   - Inheritance
   - Encapsulation

4. DOM Manipulation
   - Selecting elements
   - Event handling
   - CSS manipulation

5. Modern JavaScript (ES6+)
   - Template literals
   - Destructuring
   - Spread operator
   - Modules`,
        status: 'ready',
        quizCount: 0,
      },
    ];

    for (const docData of sampleDocuments) {
      let doc = await DocumentModel.findOne({ fileName: docData.fileName, userId: docData.userId });
      if (!doc) {
        doc = await DocumentModel.create(docData);
        console.log(`✓ Created sample document: ${docData.fileName}`);
      } else {
        console.log(`✓ Sample document already exists: ${docData.fileName}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Test Credentials:');
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`Student 1: ${studentEmails[0].email} / ${studentEmails[0].password}`);
    console.log(`Student 2: ${studentEmails[1].email} / ${studentEmails[1].password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
