import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TestResult } from '@/models/TestResult';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { username, wpm, accuracy, mode, duration } = await req.json();

    // Validate input
    if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid data' },
        { status: 400 }
      );
    }

    // Save test result
    const result = await TestResult.create({
      username: username || 'Anonymous',
      wpm,
      accuracy,
      mode,
      duration,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Result saved to leaderboard!',
      resultId: result._id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save result' },
      { status: 500 }
    );
  }
}
