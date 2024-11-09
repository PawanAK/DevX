import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, walletAddress } = await request.json();

    if (!username && !walletAddress) {
      return NextResponse.json(
        { message: 'Username or wallet address is required' },
        { status: 400 }
      );
    }

    const query = username ? { username } : { walletAddress };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        username: user.username,
        userId: user.userId,
        walletAddress: user.walletAddress,
        sbtAddress: user.sbtAddress
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error logging in', error: error.message },
      { status: 500 }
    );
  }
} 