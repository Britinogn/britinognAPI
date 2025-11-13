// import express from 'express';
// import projectController from '../controllers/projectController'; // No {}
// import authMiddleware from '../middleware/authMiddleware';
// import uploadProject from '../middleware/uploadMiddleware'; // No {}

// const router = express.Router();

// // Project Routes
// router.get('/', projectController.getAllProject);
// router.get('/:id', projectController.getProjectById);

// // Project Routes(admin)
// router.post('/', authMiddleware, uploadProject.single('imageURL'), projectController.createProject);
// router.put('/:id', authMiddleware, uploadProject.single('imageURL'), projectController.updateProject);
// router.delete('/:id', authMiddleware, projectController.deleteProject);

// export default router;


// src/routes/projectRoutes.ts

import express from 'express';
import projectController from '../controllers/projectController';
import authMiddleware from '../middleware/authMiddleware';
import uploadProject from '../middleware/uploadMiddleware';

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================
router.get('/', projectController.getAllProject);
router.get('/:id', projectController.getProjectById);

// ============================================
// ADMIN ROUTES - Authentication required
// ============================================

// CREATE: Handle multiple images (max 10)
// Changed from .single('imageURL') to .array('images', 10)
router.post(
  '/', 
  authMiddleware, 
  uploadProject.array('images', 10),  // ✅ Changed: Now accepts multiple images
  projectController.createProject
);

// UPDATE: Handle multiple images (max 10)
// Changed from .single('imageURL') to .array('images', 10)
router.put(
  '/:id', 
  authMiddleware, 
  uploadProject.array('images', 10),  // ✅ Changed: Now accepts multiple images
  projectController.updateProject
);

// DELETE: No changes needed
router.delete('/:id', authMiddleware, projectController.deleteProject);

export default router;