import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePasswords, generateRefreshToken, generateToken, hashPassword } from "../services/auth.service";
import { sendPasswordResetEmail } from "../services/email.service";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        systemRole: "ORG_USER", // Default role for new users
        createdBy: "system",
      },
    });

    await prisma.userToken.create({
      data: {
        userId: user.id,
        isVerified: false,
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { orgUsers: true }, 
    });
    if (!user || !(await comparePasswords(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken();

    await prisma.userToken.update({
      where: { userId: user.id }, // Using userId as the unique identifier
      data: { refreshToken },
    });

    const response = {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.orgUsers.length > 0, // Check if user is linked to an organisation
        systemRole: user.systemRole,
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id; // Assuming you have auth middleware that adds user to req

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await comparePasswords(currentPassword, user.password))) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = generateRefreshToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.userToken.update({
      where: { userId: user.id }, // Using userId as the unique identifier
      data: { resetToken, resetTokenExpiry },
    });

    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const userToken = await prisma.userToken.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!userToken) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.userToken.update({
      where: { userId: userToken.userId }, // Using userId as the unique identifier
      data: { resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const userToken = await prisma.userToken.findFirst({
      where: { refreshToken },
    });

    if (!userToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateToken(userToken.userId, "");
    const newRefreshToken = generateRefreshToken();

    await prisma.userToken.update({
      where: { userId: userToken.userId }, // Using userId as the unique identifier
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error });
  }
};