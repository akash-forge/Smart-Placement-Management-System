import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getOptionalUser } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all students
export const getAllStudents = async (req: any, res: any) => {
  try {
      const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            avatarUrl: true,
          },
        },
      },
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error });
  }
};

//GET Student by ID
export const getStudentById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const job = await prisma.student.findUnique({
      where: {
        id: Number(id), 
      },
    });

    if (!job) {
      return res.status(404).json({ error: "student not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// Create a student
export const createStudent = async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      phone,
      registerNumber,
      department,
      batch,
      year,
      resumeUrl,
      cgpa,
      skills,
      status,
      userData,
      avatarUrl,
    } = req.body;

    if (!userData || !userData.email || !userData.password || !userData.role || !userData.avatarUrl) {
      return res.status(400).json({ message: 'User data is missing or incomplete' });
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // This endpoint must stay public for self-registration (no account
    // exists yet to authenticate with), but a student added by Admin/Staff
    // through the Add Student modal is already vetted by a trusted role —
    // auto-verify in that case instead of making them wait on themselves.
    const requester = getOptionalUser(req);
    let verificationStatus: 'PENDING' | 'VERIFIED' = 'PENDING';
    if (requester?.role === 'ADMIN') {
      verificationStatus = 'VERIFIED';
    } else if (requester?.role === 'STAFF') {
      // Only auto-verify if this Staff account has itself been verified by
      // an Admin — an unverified Staff account's vetting can't be trusted
      // yet, so a student they add should wait in Pending like any other.
      const requesterStaff = await prisma.staff.findUnique({ where: { userId: requester.id } });
      verificationStatus = requesterStaff?.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING';
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        registerNumber,
        department,
        batch,
        year: Number(year),
        resumeUrl,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        skills,
        verificationStatus,
        // status: "PLACED",
        user: {
          create: {
            name: userData.name || name, // fallback to student name
            email: userData.email,
            password: hashedPassword,
            role: userData.role, // e.g., 'STUDENT'
            phoneno: userData.phoneno || phone,
            avatarUrl: userData.avatarUrl,
          },
        },
      },
    });

    res.status(201).json({ message: 'Student and user created', student: newStudent });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'An account with this email, register number, or staff ID already exists.' });
      return;
    }
    res.status(500).json({ message: 'Failed to create student and user' });
  }
};

// // Update a student
export const updateStudent = async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

    // Previously missing: any authenticated user could PATCH any student's
    // id here, not just their own. Admin/Staff can edit any student (that's
    // part of their role); a Student may only edit their own record.
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Student not found' });
    const isOwner = existing.userId === req.user?.id;
    const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const {
      name,
      email,
      phone,
      registerNumber,
      department,
      batch,
      year,
      resumeUrl,
      cgpa,
      skills,
      status,
    } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        registerNumber,
        department,
        batch,
        // Was `Number(year)` unconditionally — Number(undefined) is NaN,
        // which crashed this update whenever a partial edit omitted year.
        year: year !== undefined ? Number(year) : undefined,
        resumeUrl,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        skills,
        // status,
      },
    });

    res.status(200).json({ message: 'Student updated', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error });
  }
};

// Delete a student
// PATCH /student/:id/verify — Admin or Staff only (enforced at the route
// level). Separate from the general self-edit endpoint for the same reason
// as verifyCompany/verifyStaff.
export const verifyStudent = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { verificationStatus } = req.body;
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'verificationStatus must be PENDING, VERIFIED, or REJECTED' });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: { verificationStatus },
    });

    return res.status(200).json({ message: 'Updated', student: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update verification status' });
  }
};

export const deleteStudent = async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

    await prisma.student.delete({ where: { id } });

    res.status(200).json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error });
  }
};

