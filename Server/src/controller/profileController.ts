import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserProfile = async (req: any, res: any) => {
  let id = req.params.id;
  const { role } = req.query;

  if (!id || !role || typeof role !== "string") {
    return res.status(400).json({ message: "Missing or invalid id/role" });
  }

  id = Number(id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    let profile;

    switch (role) {
      case "ADMIN":
        // Admin has no linked profile table (unlike Staff/Student/Company) —
        // this previously queried prisma.staff.findUnique, which returned
        // null for every admin (no admin has a Staff row), so viewing an
        // admin's own profile always 404'd with "Profile not found."
        profile = await prisma.user.findUnique({
          where: { id },
          select: { name: true, email: true, role: true, avatarUrl: true, phoneno: true },
        });
        if (profile) {
          profile = {
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            role: profile.role,
            phone: profile.phoneno,
          };
        }
        break;

      case "STAFF":
        profile = await prisma.staff.findUnique({
          where: { userId: id },
          include: {
            user: {
              select: { name: true, email: true, role: true, avatarUrl: true },
            },
          },
        });
        if (profile) {
          profile = {
            name: profile.user.name,
            email: profile.user.email,
            avatarUrl: profile.user.avatarUrl,
            role: profile.user.role,
            phone: profile.phone,
            department: profile.department,
            designation: profile.designation,
            // Previously missing — this is the field the frontend needs to
            // refresh a logged-in staff member's stale, login-time
            // verification snapshot once an admin approves them.
            verificationStatus: profile.verificationStatus,
          };
        }
        break;

      case "STUDENT":
        profile = await prisma.student.findUnique({
          where: { userId: id },
          include: {
            user: {
              select: { name: true, email: true, role: true, avatarUrl: true },
            },
          },
        });
        if (profile) {
          profile = {
            name: profile.user.name,
            email: profile.user.email,
            avatarUrl: profile.user.avatarUrl,
            role: profile.user.role,
            phone: profile.phone,
            registerNumber: profile.registerNumber,
            department: profile.department,
            batch: profile.batch,
            year: profile.year,
            resumeUrl: profile.resumeUrl,
            cgpa: profile.cgpa,
            skills: profile.skills,
            verificationStatus: profile.verificationStatus,
          };
        }
        break;

      case "COMPANY":
        profile = await prisma.company.findUnique({
          where: { userId: id },
          include: {
            user: {
              select: { role: true, avatarUrl: true, },
            },
          },
        });
        if (profile) {
          profile = {
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.user.avatarUrl,
            role: profile.user.role,
            phone: profile.phone,
            website: profile.website || undefined,
            address: profile.address,
            industry: profile.industry,
            description: profile.description,
            verificationStatus: profile.verificationStatus,
          };
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

