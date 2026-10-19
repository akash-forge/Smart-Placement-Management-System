import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 
import { getOptionalUser } from '../middleware/auth';

const prisma = new PrismaClient();

export const getAllCompanies = async (req: any, res: any) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(200).json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    res.status(500).json({ message: "Failed to fetch companies", error });
  }
};

//GET company by ID
export const getCompanyById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const job = await prisma.company.findUnique({
      where: {
        id: Number(id), // convert only if `id` is an Int in your schema
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
};

export const createCompany = async (req: any, res: any) => {
  try {
    const { name, email, phone, website, address, industry, description, userData } = req.body;
  if (!userData || !userData.email || !userData.password || !userData.role) {
      return res.status(400).json({ message: 'User data is missing or incomplete' });
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Only Admin verifies Company (per the planned hierarchy), so only an
    // Admin-created company record is auto-verified.
    const requester = getOptionalUser(req);
    const verificationStatus = requester && requester.role === 'ADMIN' ? 'VERIFIED' : 'PENDING';

    const newCompany = await prisma.company.create({
      data: {
        name,
        email,
        phone,
        website,
        address,
        industry,
        description,
        verificationStatus,
        user: {
            create: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            phoneno: userData.phoneno,
            avatarUrl: userData.avatarUrl,
          }, 
        },
      },
    });


    res.status(201).json(newCompany);
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'An account with this email, register number, or staff ID already exists.' });
      return;
    }
    res.status(500).json({ message: "Failed to create company" });
  }
};

export const updateCompany = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    // Previously missing: any authenticated user could PATCH any company's
    // id here. Only Admin or the company itself may edit it.
    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Company not found' });
    const isOwner = existing.userId === req.user?.id;
    if (!isOwner && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const { name, email, phone, website, address, industry, description } = req.body;

    const updated = await prisma.company.update({
      where: { id },
      data: { name, email, phone, website, address, industry, description },
    });

    return res.status(200).json({ message: 'Updated', company: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed', error });
  }
};

// PATCH /company/:id/verify — admin-only (enforced at the route level with
// requireRole(['ADMIN'])). Deliberately a separate endpoint from the
// general self-edit one above, not an extra field accepted there, so a
// company can't just include isVerified in its own profile edit request
// and grant itself verification.
export const verifyCompany = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { verificationStatus } = req.body;
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'verificationStatus must be PENDING, VERIFIED, or REJECTED' });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: { verificationStatus },
    });

    return res.status(200).json({ message: 'Updated', company: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update verification status' });
  }
};

// DELETE /company/:id
export const deleteCompany = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.company.delete({ where: { id } });
    res.json({ message: "Company deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error });
  }
};
