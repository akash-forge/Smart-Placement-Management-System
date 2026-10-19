import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to your .env file.');
}

// GET all users
export const getAllUsers = async (req: any, res: any) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneno: true,
      role: true,
      avatarUrl: true,
      // password intentionally omitted
    },
  });
  res.json(users);
};

// GET user by ID
export const getUserById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        role: true,
        avatarUrl: true,
        // password intentionally omitted
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Create new user
export const createUser = async (req: any, res: any) => {
  const { name, email, phoneno, password, role, avatarUrl } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneno,
        password: hashedPassword,
        role,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        role: true,
        avatarUrl: true,
        // password intentionally omitted
      },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
};

//Check user details on Login
export const loginUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ADMIN has no profile table of its own (nothing to verify), so it's
    // treated as always-verified. The other three roles look up their own
    // record's verificationStatus so the frontend can show a pending banner
    // right after login, without a second request.
    let verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' = 'VERIFIED';
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      verificationStatus = student?.verificationStatus ?? 'PENDING';
    } else if (user.role === 'STAFF') {
      const staff = await prisma.staff.findUnique({ where: { userId: user.id } });
      verificationStatus = staff?.verificationStatus ?? 'PENDING';
    } else if (user.role === 'COMPANY') {
      const company = await prisma.company.findUnique({ where: { userId: user.id } });
      verificationStatus = company?.verificationStatus ?? 'PENDING';
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      verificationStatus,
    };
    return res.status(200).json({ message: 'Login successful', token, userData, });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error });
  }
};

// Update Profile picture
export const putData = async (req: any, res: any) => {
  const userId = parseInt(req.params.id);

  if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'You can only update your own account.' });
  }

  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.status(400).json({ message: "avatarUrl is required" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        role: true,
        avatarUrl: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user avatar:", error);
    return res.status(500).json({ message: "Failed to update user", error });
  }
}

//Update user data
export const patchData = async (req: any, res: any) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  // Previously missing entirely: any authenticated user (any role) could
  // PATCH any other user's id here and overwrite their name, email, or
  // password — a full account-takeover vector, including against Admin,
  // just by guessing/iterating ids. Only the account's own owner or an
  // Admin may update it now.
  if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'You can only update your own account.' });
  }

  const { name, email, phoneno, password, avatarUrl } = req.body;
  const updateData: any = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phoneno) updateData.phoneno = phoneno;
  if (password) updateData.password = await bcrypt.hash(password, 10);
  if (avatarUrl) updateData.avatarUrl = avatarUrl;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        role: true,
        avatarUrl: true,
      },
    });

    return res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error: any) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

//Delete user by ID
export const deleteUserById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};