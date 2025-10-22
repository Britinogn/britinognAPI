import express from 'express';
import blogController from '../controllers/blogPostController'; // No {}
import authMiddleware from '../middleware/authMiddlware'; // No {}

const router = express.Router();

// Blog Routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Blog Routes(admin)
router.post('/', authMiddleware, blogController.createBlog);
router.put('/:id', authMiddleware, blogController.updateBlog);
router.delete('/:id', authMiddleware, blogController.deleteBlog);

export default router;