"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const staffController_1 = require("../controller/staffController");
const router = express_1.default.Router();
router.get('/', staffController_1.getAllStaffs);
router.post('/', staffController_1.createStaff);
router.patch('/:id', staffController_1.updateStaff);
router.delete('/:id', staffController_1.deleteStaff);
exports.default = router;
