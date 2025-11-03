import express from 'express';
import contactController from '../controllers/contactController'; // No {}
import authMiddleware from '../middleware/authMiddleware'; // No {}

const router = express.Router();

// Contact Routes (public for submission)
router.post('/', contactController.createContact);

// Contact Routes (admin)
router.get('/', authMiddleware, contactController.getAllContacts);
router.get('/:id', authMiddleware, contactController.getContactById);
router.put('/:id', authMiddleware, contactController.updateContact);
router.delete('/:id', authMiddleware, contactController.deleteContact);

export default router;