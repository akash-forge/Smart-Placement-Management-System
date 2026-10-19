"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.getAllStudents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all students
const getAllStudents = async (_req, res) => {
    try {
        const students = await prisma.student.findMany();
        res.status(200).json(students);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch students', error });
    }
};
exports.getAllStudents = getAllStudents;
// // Create a student
// export const createStudent = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       registerNumber,
//       department,
//       batch,
//       year,
//       resumeUrl,
//       cgpa,
//       skills,
//     } = req.body;
//     const newStudent = await prisma.student.create({
//       data: {
//         name,
//         email,
//         phone,
//         registerNumber,
//         department,
//         batch,
//         year: Number(year),
//         resumeUrl,
//         cgpa: cgpa ? parseFloat(cgpa) : undefined,
//         skills,
//       },
//     });
//     res.status(201).json({ message: 'Student created', student: newStudent });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to create student', error });
//   }
// };
// // Update a student
// export const updateStudent = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });
//     const {
//       name,
//       email,
//       phone,
//       registerNumber,
//       department,
//       batch,
//       year,
//       resumeUrl,
//       cgpa,
//       skills,
//     } = req.body;
//     const updatedStudent = await prisma.student.update({
//       where: { id },
//       data: {
//         name,
//         email,
//         phone,
//         registerNumber,
//         department,
//         batch,
//         year: Number(year),
//         resumeUrl,
//         cgpa: cgpa ? parseFloat(cgpa) : undefined,
//         skills,
//       },
//     });
//     res.status(200).json({ message: 'Student updated', student: updatedStudent });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update student', error });
//   }
// };
// Delete a student
const deleteStudent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'Invalid student ID' });
        await prisma.student.delete({ where: { id } });
        res.status(200).json({ message: 'Student deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete student', error });
    }
};
exports.deleteStudent = deleteStudent;
