import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: handlers here use `req: any, res: any` to match this codebase's
// existing convention. Mixing strictly-typed Express handlers with the
// any-typed verifyToken/requireRole middleware in the same router.get(...)
// call trips up TS's RequestHandler[] overload resolution (every handler in
// the chain needs a matching return type) — that's the TS2769 error you hit
// twice now. `any` sidesteps it without needing every handler rewritten.

// GET all jobs
export const getAllJobs = async (req: any, res: any) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

//GET jobs by ID
export const getJobById = async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: Number(id), // convert only if `id` is an Int in your schema
      },
    });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

// POST a new job
export const postNewJobs = async (req: any, res: any) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      postedDate,
      salaryMin,
      salaryMax,
      employmentType,
      benefits,
      applicationDeadline,
      contactEmail,
    } = req.body;

    // applicationDeadline (and postedDate) are required DateTime fields in
    // the schema. Previously an empty/missing date silently became
    // `new Date("")` -> Invalid Date, Prisma threw, and the frontend only
    // ever showed a generic "Failed to post job." with no indication why.
    if (!title || !company || !location || !description || !contactEmail) {
      res.status(400).json({ message: 'Title, company, location, description, and contact email are all required.' });
      return;
    }

    const parsedApplicationDeadline = new Date(applicationDeadline);
    if (!applicationDeadline || isNaN(parsedApplicationDeadline.getTime())) {
      res.status(400).json({ message: 'A valid application deadline date is required.' });
      return;
    }

    const parsedPostedDate = postedDate ? new Date(postedDate) : new Date();
    if (isNaN(parsedPostedDate.getTime())) {
      res.status(400).json({ message: 'Posted date is invalid.' });
      return;
    }

    // This route already requires verifyToken + requireRole(['COMPANY',
    // 'STAFF', 'ADMIN']), so req.user is always populated. When a Company
    // account posts, link the job to their actual Company record — this is
    // what makes real ownership checks on update/delete possible. Staff/
    // Admin posting on their own account's behalf isn't tied to one
    // specific company, so companyId stays null for those (same as it was
    // for every job before this change).
    let companyId: number | undefined;
    if (req.user?.role === 'COMPANY') {
      const ownCompany = await prisma.company.findUnique({ where: { userId: req.user.id } });
      companyId = ownCompany?.id;
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        company,
        companyId,
        location,
        description,
        requirements,        // JSON array
        responsibilities,    // JSON array
        postedDate: parsedPostedDate,
        salaryMin,
        salaryMax,
        employmentType,
        benefits,            // JSON array (optional)
        applicationDeadline: parsedApplicationDeadline,
        contactEmail,
      },
    });

    res.status(201).json(newJob);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create job. Please check all fields and try again.' });
  }
};

// Shared ownership check for updateJob/deleteJob. Staff/Admin may act on
// any job (trusted oversight roles, same pattern as the other controllers).
// A Company may only act on a job whose companyId matches their own
// Company record. Jobs posted before the companyId migration have
// companyId = null, which never matches any company's id — those are
// Staff/Admin-only to manage until reclaimed.
async function assertCanManageJob(req: any, jobId: number): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { ok: false, status: 404, message: 'Job not found' };

  if (req.user?.role === 'ADMIN' || req.user?.role === 'STAFF') {
    return { ok: true };
  }

  if (req.user?.role === 'COMPANY') {
    const ownCompany = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (ownCompany && job.companyId === ownCompany.id) {
      return { ok: true };
    }
  }

  return { ok: false, status: 403, message: 'You can only manage jobs your own company posted.' };
}

// PATCH (Update) a job
export const updateJob = async (req: any, res: any) => {
  const jobId = parseInt(req.params.id);
  try {
    const check = await assertCanManageJob(req, jobId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    // Previously spread ...req.body directly into the update, which meant
    // a company could include companyId (or id) in their own edit payload
    // and reassign the job to a different company, or otherwise write
    // fields never meant to be editable here.
    const {
      title, company, location, description, requirements, responsibilities,
      salaryMin, salaryMax, employmentType, benefits, contactEmail,
      postedDate, applicationDeadline,
    } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title, company, location, description, requirements, responsibilities,
        salaryMin, salaryMax, employmentType, benefits, contactEmail,
        postedDate: postedDate ? new Date(postedDate) : undefined,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      },
    });
    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Job not found or update failed' });
  }
};

// DELETE a job
export const deleteJob = async (req: any, res: any) => {
  const jobId = parseInt(req.params.id);
  try {
    const check = await assertCanManageJob(req, jobId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    await prisma.job.delete({ where: { id: jobId } });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Job not found or delete failed' });
  }
};
