import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { RESUME_URL_PREFIX, isUsableResumeUrl } from '../utils/resume';

const prisma = new PrismaClient();

// Resumes live under public/uploads/resumes, which index.ts already serves
// statically at /uploads — so a stored resumeUrl of "/uploads/resumes/x.pdf"
// is reachable at <API base>/uploads/resumes/x.pdf.
const resumeDir = path.join(__dirname, '../../public/uploads/resumes');
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  // The stored name is generated entirely server-side (never from the
  // uploaded filename), so a crafted filename can't traverse paths or
  // overwrite anything. The random part also makes URLs unguessable, which
  // matters because /uploads is served publicly so companies can open them.
  filename: (req: any, _file, cb) =>
    cb(null, `resume-u${req.user.id}-${crypto.randomBytes(8).toString('hex')}.pdf`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const looksLikePdf =
      file.mimetype === 'application/pdf' &&
      path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!looksLikePdf) return cb(new Error('ONLY_PDF'));
    cb(null, true);
  },
});

function localResumePath(url?: string | null): string | null {
  if (!url || !url.startsWith(RESUME_URL_PREFIX)) return null;
  // basename() strips any directory components, so this can only ever point
  // inside resumeDir no matter what string is stored in the database.
  return path.join(resumeDir, path.basename(url));
}

// Delete a stored resume file — unless a submitted application still points
// at it. Applications keep a snapshot of the resume they were sent with, so
// replacing/deleting your current resume must not break the link a company
// is using to review an application you already submitted.
async function deleteResumeFileIfUnused(url?: string | null) {
  const filePath = localResumePath(url);
  if (!filePath) return;
  const stillReferenced = await prisma.application.count({ where: { resumeUrl: url! } });
  if (stillReferenced > 0) return;
  fs.unlink(filePath, () => {});
}

// GET /resume — the logged-in student's current resume
export const getMyResume = async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    let uploadedAt: Date | null = null;
    const filePath = localResumePath(student.resumeUrl);
    if (filePath) {
      try {
        uploadedAt = fs.statSync(filePath).mtime;
      } catch {
        // File missing on disk — leave uploadedAt null
      }
    }

    // Legacy free-text junk in resumeUrl is reported as "no resume" so the
    // student is simply prompted to upload a real one (which overwrites it).
    res.status(200).json({
      resumeUrl: isUsableResumeUrl(student.resumeUrl) ? student.resumeUrl : null,
      uploadedAt,
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
};

// POST /resume — upload (or replace) the logged-in student's resume
export const uploadResume = (req: any, res: any) => {
  upload.single('resume')(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Resume must be 5 MB or smaller.' });
      }
      if (err.message === 'ONLY_PDF') {
        return res.status(400).json({ message: 'Only PDF files are allowed.' });
      }
      console.error('Resume upload error:', err);
      return res.status(500).json({ message: 'Resume upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const discard = () => fs.unlink(req.file.path, () => {});

    try {
      // The mimetype/extension checks above come from the client and can be
      // faked, so also confirm the file really starts with the PDF magic bytes.
      const fd = fs.openSync(req.file.path, 'r');
      const header = Buffer.alloc(5);
      fs.readSync(fd, header, 0, 5, 0);
      fs.closeSync(fd);
      if (header.toString('latin1') !== '%PDF-') {
        discard();
        return res.status(400).json({ message: 'That file is not a valid PDF.' });
      }

      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) {
        discard();
        return res.status(404).json({ message: 'No student profile found for this account.' });
      }

      const previousUrl = student.resumeUrl;
      const newUrl = RESUME_URL_PREFIX + req.file.filename;
      await prisma.student.update({ where: { id: student.id }, data: { resumeUrl: newUrl } });
      await deleteResumeFileIfUnused(previousUrl);

      res.status(200).json({ resumeUrl: newUrl, uploadedAt: new Date() });
    } catch (error) {
      console.error('Error saving resume:', error);
      discard();
      res.status(500).json({ message: 'Failed to save resume' });
    }
  });
};

// DELETE /resume — remove the logged-in student's current resume
export const deleteMyResume = async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    const previousUrl = student.resumeUrl;
    await prisma.student.update({ where: { id: student.id }, data: { resumeUrl: null } });
    await deleteResumeFileIfUnused(previousUrl);

    res.status(200).json({ message: 'Resume deleted' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
};
