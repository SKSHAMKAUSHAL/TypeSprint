import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TestResult } from '@/models/TestResult';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || '30s';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top scores from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const leaderboard = await TestResult.find({
      mode,
      createdAt: { $gte: yesterday }
    })
      .sort({ wpm: -1, createdAt: 1 })
      .limit(limit)
      .select('username wpm accuracy createdAt')
      .lean();

    return NextResponse.json({ 
      success: true, 
      mode,
      leaderboard 
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard', leaderboard: [] },
      { status: 500 }
    );
  }
}
