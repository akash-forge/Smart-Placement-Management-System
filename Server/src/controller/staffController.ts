import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getOptionalUser } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all staff records
export const getAllStaffs = async (req: any, res: any) => {
  try {
    const staffs = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            avatarUrl: true,
          },
        },
      },
    });
    res.status(200).json(staffs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staffs', error });
  }
};

//GET staff by ID
export const getStaffById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const job = await prisma.staff.findUnique({
      where: {
        id: Number(id), // convert only if `id` is an Int in your schema
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching staff by ID:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

// Create a new staff record
export const createStaff = async (req: any, res: any) => {
  try {
    const { name, email, phone, staffId, department, designation, userData } = req.body;

    if (!userData || !userData.email || !userData.password || !userData.role || !userData.avatarUrl) {
      return res.status(400).json({ message: 'User data is missing or incomplete' });
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Only Admin verifies Staff (per the planned hierarchy), so only an
    // Admin-created staff record is auto-verified — a Staff-created one
    // still needs Admin's review.
    const requester = getOptionalUser(req);
    const verificationStatus = requester && requester.role === 'ADMIN' ? 'VERIFIED' : 'PENDING';

    const newStaff = await prisma.staff.create({
      data: {
        name,
        email,
        phone,
        staffId: staffId || null,
        department: department || null,
        designation: designation || null,
        verificationStatus,
        user: {
          create: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role, // e.g., 'STAFF'
            phoneno: userData.phoneno,
            avatarUrl: userData.avatarUrl,
          },
        },
      },
    });

    return res.status(201).json(newStaff);
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'An account with this email, register number, or staff ID already exists.' });
      return;
    }
    return res.status(500).json({ message: 'Failed to create staff with user' });
  }
};

// Update an existing staff record by ID

export const updateStaff = async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid staff ID' });

    // Previously missing: any authenticated user could PATCH any staff id
    // here. Only Admin or the staff member themselves may edit it — unlike
    // Student, a Staff member doesn't get to edit other Staff.
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Staff not found' });
    const isOwner = existing.userId === req.user?.id;
    if (!isOwner && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const { name, email, phone, department, designation } = req.body;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { name, email, phone, department, designation },
    });

    res.status(200).json({ message: 'Staff updated', staff: updatedStaff });
  } catch (error) {
    // Handle record not found error separately if needed
    res.status(500).json({ message: 'Failed to update staff', error });
  }
};

// Delete a staff record by ID
// PATCH /staff/:id/verify — admin-only (enforced at the route level).
// Deliberately separate from the general self-edit endpoint, same reasoning
// as verifyCompany: a staff member shouldn't be able to grant themselves
// verification by including this field in their own profile edit.
export const verifyStaff = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { verificationStatus } = req.body;
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'verificationStatus must be PENDING, VERIFIED, or REJECTED' });
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: { verificationStatus },
    });

    return res.status(200).json({ message: 'Updated', staff: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update verification status' });
  }
};

export const deleteStaff = async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid staff ID' });

    await prisma.staff.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete staff', error });
  }
};
