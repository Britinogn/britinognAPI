import ProjectModel  from '../models/Projects'
import Cloudinary from '../config/cloudinary'
import { Request, Response, NextFunction } from 'express';

interface  IProjectBody {
    title: string;
    description: string;
    techStack: string[] | string;
    githubUrl: string;
    liveURL: string;
    imageURL: {
        url: string;
        public_id: string;
    }[];
    category?: string;
    yearBuilt?: number;
}

type TypedRequest<T = {}> = Request<{}, any , T>;


export const getAllProject = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        
        const totalDocuments = await ProjectModel.countDocuments();
        const totalPages = Math.ceil(totalDocuments / Number(limit));
        
        const projects = await ProjectModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        
        res.status(200).json({ 
            message: 'Projects retrieved successfully',
            totalPages, 
            totalDocuments,
            page: Number(page), 
            limit: Number(limit), 
            projects 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving projects';
        res.status(500).json({ error: errorMessage });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if id exists and validate MongoDB ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ message: 'Invalid project ID format' });
            return;
        }

        const project = await ProjectModel.findById(id);
        
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        
        res.status(200).json({ 
            message: 'Project retrieved successfully', 
            project 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving the project';
        res.status(500).json({ error: errorMessage });
    }
};

export const createProject =  async (req: TypedRequest<IProjectBody>, res: Response) => {
    try {
        const {title, description,techStack ,githubUrl , liveURL} = req.body;
        
        if (!title|| !description|| !techStack|| !githubUrl|| !liveURL) {
            res.status(400).json({message: 'All fields are required'})
            return;
        }

        // ✅ Parse techStack to ensure it's always an array
        let parsedTechStack: string[];
        if (typeof techStack === 'string') {
            try {
                parsedTechStack = JSON.parse(techStack);
            } catch (e) {
                // If parsing fails, treat as comma-separated or single value
                parsedTechStack = techStack.includes(',') 
                    ? techStack.split(',').map(s => s.trim())
                    : [techStack];
            }
        } else if (Array.isArray(techStack)) {
            parsedTechStack = techStack;
        } else {
            res.status(400).json({ message: 'Invalid techStack format' });
            return;
        }

        // Normalize req.files to an array of Express.Multer.File
        const filesArray: Express.Multer.File[] = Array.isArray(req.files)
            ? req.files
            : req.files
            ? // req.files might be an object with field names: { photos: File[], other: File[] }
            Object.values(req.files).flat() as Express.Multer.File[]
            : [];

        // Now map safely
        const imageURL = filesArray.map((file) => ({
            url: file.path,      // or cloudinary url / file.location depending on uploader
            public_id: file.filename
        }));


        const newProject = await ProjectModel.create({
            title,
            description,
            techStack: parsedTechStack,
            githubUrl,
            liveURL,
            imageURL
        })

        //await newProject.save();

        res.status(201).json({
            message: 'Project registered successfully',
            Project: {
                id: newProject._id,
                title: newProject.title,
                description: newProject.description,
                techStack: newProject.techStack,
                githubUrl: newProject.githubUrl,
                liveURL: newProject.liveURL,
                imageURL: newProject.imageURL
            }
        });
        

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message :'An error occurred while creating the project';
        res.status(400).json({ error: errorMessage });
    }
};


export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const {title, description,techStack ,githubUrl , liveURL} = req.body;

        // ✅ Parse techStack to ensure it's always an array
        let parsedTechStack: string[] | undefined;
        if (techStack) {
            if (typeof techStack === 'string') {
                try {
                    parsedTechStack = JSON.parse(techStack);
                } catch (e) {
                    parsedTechStack = techStack.includes(',')
                        ? techStack.split(',').map(s => s.trim())
                        : [techStack];
                }
            } else if (Array.isArray(techStack)) {
                parsedTechStack = techStack;
            }
        }

        project.title = title ?? project.title;
        project.description = description ?? project.description;
        project.techStack = parsedTechStack ?? project.techStack;
        project.githubUrl = githubUrl ?? project.githubUrl;
        project.liveURL = liveURL ?? project.liveURL;
        
        if (req.files && (req.files as any[]).length > 0) {
            // Delete old images from Cloudinary
            if (project.imageURL && project.imageURL.length > 0) {
                for (const img of project.imageURL) {
                    try {
                        await Cloudinary.uploader.destroy(img.public_id);
                    } catch (e) {
                        console.error('Cloudinary deletion error', e);
                    }
                }
            }
            // Set new images
            project.imageURL = (req.files as any[]).map((file: any) => ({ 
                url: file.path, 
                public_id: file.filename 
            }));
        }

        
        await project.save();
        res.json({ message: 'Project updated successfully', project });
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the project';
        res.status(400).json({ error: errorMessage });
    }
};


export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Cloudinary deletion for multiple images
        if (project.imageURL && project.imageURL.length > 0) {
            for (const img of project.imageURL) {
                try {
                    await Cloudinary.uploader.destroy(img.public_id);
                } catch (e) {
                    console.error('Cloudinary deletion error', e);
                }
            }
        }
        
        await ProjectModel.findByIdAndDelete(req.params.id);
        
        return res.json({ message: 'Project deleted successfully' });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the project';
        res.status(500).json({ error: errorMessage });
    }
};

// At the end of projectController.ts
export default {
    getAllProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};