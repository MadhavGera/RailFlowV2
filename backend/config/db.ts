import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI as string;
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};
