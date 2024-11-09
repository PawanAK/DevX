import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, walletAddress } = await request.json();

    if (!username || !walletAddress) {
      return NextResponse.json(
        { message: 'Username and wallet address are required' },
        { status: 400 }
      );
    }

    // Try to find existing user
    let user = await User.findOne({ walletAddress });

    if (user) {
      // User exists, return user data
      return NextResponse.json({
        message: 'User authenticated successfully',
        user: {
          username: user.username,
          walletAddress: user.walletAddress,
          sbtAddress: user.sbtAddress
        }
      });
    }

    // User doesn't exist, create new user
    user = new User({
      username,
      walletAddress
    });

    await user.save();

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        username: user.username,
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
      { message: 'Error processing request', error: error.message },
      { status: 500 }
    );
  }
} 