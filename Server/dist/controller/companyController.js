"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getAllCompanies = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllCompanies = async (req, res) => {
    const company = await prisma.company.findMany();
    res.json(company);
};
exports.getAllCompanies = getAllCompanies;
const createCompany = async (req, res) => {
    try {
        const { name, email, phone, website, industry, description } = req.body;
        const newCompany = await prisma.company.create({
            data: { name, email, phone, website, industry, description },
        });
        res.status(201).json(newCompany);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create company" });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'Invalid ID' });
        const { name, email, phone, website, industry, description } = req.body;
        const updated = await prisma.company.update({
            where: { id },
            data: { name, email, phone, website, industry, description },
        });
        return res.status(200).json({ message: 'Updated', company: updated });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed', error });
    }
};
exports.updateCompany = updateCompany;
// DELETE /company/:id
const deleteCompany = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.company.delete({ where: { id } });
        res.json({ message: "Company deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting company", error });
    }
};
exports.deleteCompany = deleteCompany;
