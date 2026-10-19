import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMetrics = async (req: any, res: any): Promise<void> => {
  try {
    const staffsCount = await prisma.staff.count();
    const studentsCount = await prisma.student.count();
    const companiesCount = await prisma.company.count();
    const placedStudentsCount = await prisma.student.count({ where: { status: 'PLACED' } });
    res.status(200).json({
      staffs: staffsCount,
      students: studentsCount,
      companies: companiesCount,
      placedStudents: placedStudentsCount,
    });

  } catch (error: unknown) {
    console.error("Error fetching metrics:", error);

    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};


