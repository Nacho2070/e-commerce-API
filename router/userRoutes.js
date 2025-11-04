import express from 'express';
const router = express.Router();

import {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	addAddress,
	removeAddress
} from '../controller/userController.js';

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Address management
router.post('/:id/addresses', addAddress);
router.delete('/:id/addresses/:index', removeAddress);

export default router;
