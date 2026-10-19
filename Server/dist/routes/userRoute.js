"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.get('/', userController_1.getAllUsers);
router.post('/', userController_1.createUser);
router.post('/login', userController_1.loginUser);
router.patch('/:id', userController_1.patchData);
// router.delete('/:id') 
exports.default = router;
