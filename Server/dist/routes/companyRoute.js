"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controller/companyController");
exports.router = express_1.default.Router();
exports.router.get('/', companyController_1.getAllCompanies);
exports.router.post('/', companyController_1.createCompany);
exports.router.patch('/:id', companyController_1.updateCompany);
exports.router.delete('/:id', companyController_1.deleteCompany);
