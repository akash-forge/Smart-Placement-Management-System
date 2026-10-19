import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getOwnStudentId(userId: number): Promise<number | null> {
  const student = await prisma.student.findUnique({ where: { userId } });
  return student?.id ?? null;
}

// GET /project — the logged-in student's own projects
export const getMyProjects = async (req: any, res: any) => {
  try {
    const studentId = await getOwnStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }
    const projects = await prisma.project.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// POST /project — add one for the logged-in student
export const createProject = async (req: any, res: any) => {
  try {
    const studentId = await getOwnStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ message: 'No student profile found for this account.' });
    }

    const { title, description, technologies, duration, link } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const project = await prisma.project.create({
      data: {
        studentId,
        title,
        description,
        technologies: Array.isArray(technologies) ? technologies : [],
        duration: duration || null,
        link: link || null,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

// DELETE /project/:id — only the owning student may delete their own
export const deleteProject = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid project ID' });

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const studentId = await getOwnStudentId(req.user.id);
    if (project.studentId !== studentId) {
      return res.status(403).json({ message: 'You can only delete your own projects.' });
    }

    await prisma.project.delete({ where: { id } });
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
