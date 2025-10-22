import Blog from '../models/BlogPost';
import Cloudinary from '../config/cloudinary';
import { Request, Response, NextFunction } from 'express';

interface IBlogBody {
    title: string;
    description: string;
    url: string;
    platform: string;
    publishedAt: Date;
    imageURL: {
        url: string;
        public_id: string;
    };
}

type TypedRequest<T = {}> = Request<{}, any, T>;

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        
        const totalDocuments = await Blog.countDocuments();
        const totalPages = Math.ceil(totalDocuments / Number(limit));
        
        const blogs = await Blog.find()
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        
        res.status(200).json({ 
            message: 'Blogs retrieved successfully',
            totalPages, 
            totalDocuments,
            page: Number(page), 
            limit: Number(limit), 
            blogs 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving blogs';
        res.status(500).json({ error: errorMessage });
    }
};

export const getBlogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if id exists and validate MongoDB ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ message: 'Invalid blog ID format' });
            return;
        }

        const blog = await Blog.findById(id);
        
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }
        
        res.status(200).json({ 
            message: 'Blog retrieved successfully', 
            blog 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving the blog';
        res.status(500).json({ error: errorMessage });
    }
};

export const createBlog = async (req: TypedRequest<IBlogBody>, res: Response) => {
    try {
        const { title, description, url, platform, publishedAt } = req.body;
        if (!title || !url) {
            res.status(400).json({ message: 'Title and URL are required' });
            return;
        }

        // Handle image from multer
        const imageURL = req.file ? {
            url: req.file.path, // or cloudinary url
            public_id: req.file.filename
        } : undefined;

        const newBlog = await Blog.create({
            title,
            description,
            url,
            platform,
            publishedAt: publishedAt || new Date(),
            imageURL
        });

        res.status(201).json({
            message: 'Blog created successfully',
            blog: {
                id: newBlog._id,
                title: newBlog.title,
                description: newBlog.description,
                url: newBlog.url,
                platform: newBlog.platform,
                publishedAt: newBlog.publishedAt,
                imageURL: newBlog.imageURL
            }
        });
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the blog';
        res.status(400).json({ error: errorMessage });
    }
};

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        const { title, description, url, platform, publishedAt } = req.body;

        blog.title = title ?? blog.title;
        blog.description = description ?? blog.description;
        blog.url = url ?? blog.url;
        blog.platform = platform ?? blog.platform;
        blog.publishedAt = publishedAt ?? blog.publishedAt;
        
        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (blog.imageURL && blog.imageURL.public_id) {
                try {
                    await Cloudinary.uploader.destroy(blog.imageURL.public_id);
                } catch (e) {
                    console.error('Cloudinary deletion error', e);
                }
            }
            blog.imageURL = { 
                url: req.file.path || req.file.filename, 
                public_id: req.file.filename 
            };
        }

        await blog.save();
        res.json({ message: 'Blog updated successfully', blog });
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the blog';
        res.status(400).json({ error: errorMessage });
    }
};

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        // Cloudinary deletion if present
        if (blog.imageURL && blog.imageURL.public_id) {
            try {
                await Cloudinary.uploader.destroy(blog.imageURL.public_id);
            } catch (e) {
                console.error('Cloudinary deletion error', e);
            }
        }
        
        await Blog.findByIdAndDelete(req.params.id);
        
        return res.json({ message: 'Blog deleted successfully' });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the blog';
        res.status(500).json({ error: errorMessage });
    }
};

// At the end of blogController.ts
export default {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
};