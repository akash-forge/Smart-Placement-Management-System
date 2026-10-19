import { PrismaClient } from '@prisma/client';
import { isUsableResumeUrl } from '../utils/resume';

const prisma = new PrismaClient();

// applicationDeadline is stored as a date (midnight UTC of the chosen day),
// so "the deadline has passed" means the whole deadline day is over — not
// the instant that day began. Without this, applying on the deadline day
// itself would be wrongly rejected.
const DAY_MS = 24 * 60 * 60 * 1000;
export const isPastDeadline = (deadline: Date) => deadline.getTime() + DAY_MS < Date.now();

// POST /application { jobId } — the logged-in student applies to a job
export const applyToJob = async (req: any, res: any) => {
  try {
    const jobId = Number(req.body?.jobId);
    if (!Number.isInteger(jobId)) {
      return res.status(400).json({ message: 'A valid jobId is required.' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    // Matches the "pending verification" banner promise: a student must be
    // verified by staff before they can apply to anything.
    if (student.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        code: 'NOT_VERIFIED',
        message: 'Your account must be verified by a staff member before you can apply to jobs.',
      });
    }

    if (!isUsableResumeUrl(student.resumeUrl)) {
      return res.status(400).json({
        code: 'RESUME_REQUIRED',
        message: 'Upload your resume before applying.',
      });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (isPastDeadline(job.applicationDeadline)) {
      return res.status(400).json({
        code: 'DEADLINE_PASSED',
        message: 'The application deadline for this job has passed.',
      });
    }

    const application = await prisma.application.create({
      data: { studentId: student.id, jobId, resumeUrl: student.resumeUrl },
    });
    res.status(201).json(application);
  } catch (error: any) {
    // Unique (studentId, jobId): the database itself guarantees one
    // application per student per job, even if two requests race.
    if (error?.code === 'P2002') {
      return res.status(409).json({
        code: 'ALREADY_APPLIED',
        message: 'You have already applied to this job.',
      });
    }
    console.error('Error applying to job:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

// GET /application/mine — the logged-in student's own applications
export const getMyApplications = async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            employmentType: true,
            applicationDeadline: true,
          },
        },
      },
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// DELETE /application/:id — withdraw one of your own applications
export const withdrawApplication = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid application ID' });

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student || application.studentId !== student.id) {
      return res.status(403).json({ message: 'You can only withdraw your own applications.' });
    }

    // Once a company has acted on it (shortlisted/rejected/hired) it's part
    // of their records — only an application still awaiting review can be
    // pulled back.
    if (application.status !== 'APPLIED') {
      return res.status(400).json({ message: 'Only applications still awaiting review can be withdrawn.' });
    }

    await prisma.application.delete({ where: { id } });
    res.status(200).json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ message: 'Failed to withdraw application' });
  }
};
