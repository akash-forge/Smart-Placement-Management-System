import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All of these are student-self-service — a student manages only their own
// certifications. req.user.id is the User id (from the JWT); every
// operation first resolves that to the caller's own Student record, so
// there's no way to read/create/delete another student's certifications by
// passing a different id — the id always comes from the token, never from
// the request body or URL for "whose" the record is.

async function getOwnStudentId(userId: number): Promise<number | null> {
  const student = await prisma.student.findUnique({ where: { userId } });
  return student?.id ?? null;
}

// GET /certification — the logged-in student's own certifications
export const getMyCertifications = async (req: any, res: any) => {
  try {
    const studentId = await getOwnStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }
    const certifications = await prisma.certification.findMany({
      where: { studentId },
      orderBy: { issueDate: 'desc' },
    });
    res.status(200).json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ message: 'Failed to fetch certifications' });
  }
};

// POST /certification — add one for the logged-in student
export const createCertification = async (req: any, res: any) => {
  try {
    const studentId = await getOwnStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    const { name, authority, issueDate, credentialUrl } = req.body;
    if (!name || !authority || !issueDate) {
      return res.status(400).json({ message: 'Name, authority, and issue date are required.' });
    }

    const parsedDate = new Date(issueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Issue date is invalid.' });
    }

    const certification = await prisma.certification.create({
      data: { studentId, name, authority, issueDate: parsedDate, credentialUrl: credentialUrl || null },
    });
    res.status(201).json(certification);
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({ message: 'Failed to create certification' });
  }
};

// DELETE /certification/:id — only the owning student may delete their own
export const deleteCertification = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid certification ID' });

    const certification = await prisma.certification.findUnique({ where: { id } });
    if (!certification) return res.status(404).json({ message: 'Certification not found' });

    const studentId = await getOwnStudentId(req.user.id);
    if (certification.studentId !== studentId) {
      return res.status(403).json({ message: 'You can only delete your own certifications.' });
    }

    await prisma.certification.delete({ where: { id } });
    res.status(200).json({ message: 'Certification deleted' });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({ message: 'Failed to delete certification' });
  }
};
