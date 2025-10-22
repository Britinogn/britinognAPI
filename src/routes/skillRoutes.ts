import express from 'express';
import skillController from '../controllers/skillController'; // No {}
import authMiddleware from '../middleware/authMiddlware';

const router = express.Router();

// Skill Routes (public)
router.get('/', skillController.getAllSkills);
router.get('/grouped', skillController.getGroupedSkills);
router.get('/:id', skillController.getSkillById);

// Skill Routes (admin)
router.post('/', authMiddleware, skillController.createSkill);
router.put('/:id', authMiddleware, skillController.updateSkill);
router.delete('/:id', authMiddleware, skillController.deleteSkill);

export default router;