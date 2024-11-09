import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, userId, walletAddress, sbtAddress } = await request.json();

    if (!username || !userId || !walletAddress) {
      return NextResponse.json(
        { message: 'Username, userId, and walletAddress are required' },
        { status: 400 }
      );
    }

    const user = new User({
      username,
      userId,
      walletAddress,
      sbtAddress
    });

    await user.save();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        username: user.username,
        userId: user.userId,
        walletAddress: user.walletAddress,
        sbtAddress: user.sbtAddress
      }
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Username or wallet address already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Error creating user', error: error.message },
      { status: 500 }
    );
  }
} 