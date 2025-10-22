import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from '../config/cloudinary'

//project image storage 
const projectStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'project_images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{width: 1200, height: 1200, crop: 'limit'}]
    })
});

const uploadProject = multer({
    storage: projectStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

export default uploadProject;