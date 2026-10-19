"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getAllStaffs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all staff records
const getAllStaffs = async (req, res) => {
    try {
        const staffs = await prisma.staff.findMany();
        res.status(200).json(staffs);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch staffs', error });
    }
};
exports.getAllStaffs = getAllStaffs;
// Create a new staff record
const createStaff = async (req, res) => {
    try {
        const { name, email, phone, department, designation } = req.body;
        const newStaff = await prisma.staff.create({
            data: {
                name,
                email,
                phone,
                department,
                designation,
            },
        });
        res.status(201).json({ message: 'Staff created', staff: newStaff });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create staff', error });
    }
};
exports.createStaff = createStaff;
// Update an existing staff record by ID
const updateStaff = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'Invalid staff ID' });
        const { name, email, phone, department, designation } = req.body;
        const updatedStaff = await prisma.staff.update({
            where: { id },
            data: { name, email, phone, department, designation },
        });
        res.status(200).json({ message: 'Staff updated', staff: updatedStaff });
    }
    catch (error) {
        // Handle record not found error separately if needed
        res.status(500).json({ message: 'Failed to update staff', error });
    }
};
exports.updateStaff = updateStaff;
// Delete a staff record by ID
const deleteStaff = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'Invalid staff ID' });
        await prisma.staff.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Staff deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete staff', error });
    }
};
exports.deleteStaff = deleteStaff;
