"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchData = exports.loginUser = exports.createUser = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = 'your-secret-key';
const getAllUsers = async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res) => {
    const { name, email, phoneno, password } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phoneno,
                password: hashedPassword,
            },
        });
        res.status(201).json(user);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating user', error: err });
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });
        return res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        return res.status(500).json({ message: 'Login failed', error });
    }
};
exports.loginUser = loginUser;
const patchData = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    const { name, email, phoneno, password } = req.body;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (email)
        updateData.email = email;
    if (phoneno)
        updateData.phoneno = phoneno;
    if (password)
        updateData.password = password; // or hash it if needed
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return res.status(200).json({ message: "User updated", user: updatedUser });
    }
    catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.patchData = patchData;
