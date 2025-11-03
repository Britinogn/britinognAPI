import express from 'express';
import projectController from '../controllers/projectController'; // No {}
import authMiddleware from '../middleware/authMiddleware';
import uploadProject from '../middleware/uploadMiddleware'; // No {}

const router = express.Router();

// Project Routes
router.get('/', projectController.getAllProject);
router.get('/:id', projectController.getProjectById);

// Project Routes(admin)
router.post('/', authMiddleware, uploadProject.single('imageURL'), projectController.createProject);
router.put('/:id', authMiddleware, uploadProject.single('imageURL'), projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

export default router;