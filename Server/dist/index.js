"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const companyRoute_1 = __importDefault(require("./routes/companyRoute"));
const staffRoute_1 = __importDefault(require("./routes/staffRoute"));
// import studentRoute from './routes/studentRoute';
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/user', userRoute_1.default);
app.use('/company', companyRoute_1.default);
app.use('/staff', staffRoute_1.default);
// app.use('/student', studentRouter);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
