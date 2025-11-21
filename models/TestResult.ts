import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITestResult extends Document {
  username: string;
  wpm: number;
  accuracy: number;
  mode: string;
  duration: number;
  createdAt: Date;
}

const TestResultSchema = new Schema<ITestResult>({
  username: {
    type: String,
    default: 'Anonymous',
    maxlength: 20,
    trim: true,
  },
  wpm: {
    type: Number,
    required: true,
    min: 0,
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  mode: {
    type: String,
    required: true,
    enum: ['30s', '60s', '90s', '120s'],
  },
  duration: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL: Auto-delete after 24 hours (86400 seconds)
  },
});

// Indexes for fast leaderboard queries
TestResultSchema.index({ mode: 1, wpm: -1, createdAt: -1 });

export const TestResult: Model<ITestResult> = mongoose.models.TestResult || mongoose.model<ITestResult>('TestResult', TestResultSchema);
