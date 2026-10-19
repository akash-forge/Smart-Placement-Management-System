import express from 'express';
import { createUser, deleteUserById, getAllUsers, getUserById, loginUser, patchData, putData } from '../controller/userController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public — signup and login
router.post('/', createUser);
router.post('/login', loginUser);

// Listing every user is sensitive (was previously exposing password hashes
// to anyone, logged in or not) — restrict to staff/admin.
router.get('/', verifyToken, requireRole(['ADMIN', 'STAFF']), getAllUsers);

// Any signed-in user can view/edit a profile. NOTE: this does not yet check
// that :id matches req.user.id (or that the caller is an admin) — a signed-in
// student can currently still edit/view another user's record by id. Add
// that check in the controller once you're ready (compare req.user.id/role
// against the :id param).
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, putData);
router.patch('/:id', verifyToken, patchData);

// Deleting a user is destructive — admin only.
router.delete('/:id', verifyToken, requireRole(['ADMIN']), deleteUserById);

export default router;
