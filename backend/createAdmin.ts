import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const email = 'admin1@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`Admin user updated:\nEmail: ${email}\nPassword: ${password}\nRole: admin`);
    } else {
      await User.create({
        name: 'System Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        provider: 'local'
      });
      console.log(`Admin user created successfully:\nEmail: ${email}\nPassword: ${password}\nRole: admin`);
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
