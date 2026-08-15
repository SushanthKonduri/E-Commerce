import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

const generateTokens = (user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN' }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    let cleanName = (name || '').trim();
    if (!cleanName && cleanEmail) {
      const parts = cleanEmail.split('@')[0].replace(/[0-9_.]+/g, ' ').trim().split(' ');
      cleanName = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    if (!cleanName) cleanName = 'Customer Account';

    const existingUser = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      res.status(400).json({ message: 'An account with this email address already exists. Please sign in.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Strictly assign CUSTOMER role to all new self-registered accounts
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    const { accessToken, refreshToken } = generateTokens({
      ...user,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check by exact clean email match
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    // Fallback: case-insensitive match for existing legacy database entries
    if (!user) {
      const allUsers = await prisma.user.findMany();
      user = allUsers.find(u => u.email.trim().toLowerCase() === cleanEmail) || null;
    }

    if (!user) {
      res.status(404).json({ message: 'No account found with this email address. Please register a new account.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect password. Please verify your credentials and try again.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens({
      ...user,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const tokens = generateTokens({
      ...user,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error during logout' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email address is required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      res.status(404).json({ message: 'No account found with this email address. Please check your email or create an account.' });
      return;
    }

    // Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: expiresAt,
      },
    });

    console.log(`[AUTH] Password Reset OTP for ${cleanEmail}: ${otp}`);

    res.json({
      message: `A 6-digit OTP verification code has been dispatched to ${cleanEmail}.`,
      otp, // Provided for easy demo/testing in the UI toast
      email: cleanEmail,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing forgot password request' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP code are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ message: 'No active password reset request found for this email.' });
      return;
    }

    if (user.resetOtp !== cleanOtp) {
      res.status(400).json({ message: 'Invalid OTP code. Please enter the correct 6-digit code.' });
      return;
    }

    if (new Date() > user.resetOtpExpires) {
      res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
      return;
    }

    res.json({
      message: 'OTP verified successfully. Please enter your new password.',
      verified: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error verifying OTP code' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ message: 'No active password reset request found for this email.' });
      return;
    }

    if (user.resetOtp !== cleanOtp || new Date() > user.resetOtpExpires) {
      res.status(400).json({ message: 'Invalid or expired OTP session. Please restart password reset.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    res.json({
      message: 'Password has been updated successfully! You can now log in with your new password.',
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error resetting password' });
  }
};
