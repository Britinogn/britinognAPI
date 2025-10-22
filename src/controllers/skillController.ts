import SkillModel from '../models/Skills';
import { Request, Response } from 'express';

interface ISkillBody {
    name: string;
    level: string;
    category: string;
    icon?: string;
    order?: number;
}

type TypedRequest<T = {}> = Request<{}, any, T>;

// GET /api/skills - Get all skills (for visitors)
export const getAllSkills = async (req: Request, res: Response) => {
    try {
        const skills = await SkillModel.find()
            .sort({ category: 1, order: 1 });
        
        res.status(200).json({ 
            message: 'Skills retrieved successfully',
            count: skills.length,
            skills 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving skills';
        res.status(500).json({ error: errorMessage });
    }
};

// GET /api/skills/grouped - Get skills grouped by category (better for frontend)
export const getGroupedSkills = async (req: Request, res: Response) => {
    try {
        const skills = await SkillModel.find()
            .sort({ category: 1, order: 1 });

        // Group by category
        const grouped = skills.reduce((acc: any, skill) => {
            const category = skill.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                id: skill._id,
                name: skill.name,
                level: skill.level,
                icon: skill.icon,
                order: skill.order
            });
            return acc;
        }, {});

        res.status(200).json({ 
            message: 'Grouped skills retrieved successfully',
            skills: grouped 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving skills';
        res.status(500).json({ error: errorMessage });
    }
};

// GET /api/skills/:id - Get single skill (probably won't use this)
export const getSkillById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ message: 'Invalid skill ID format' });
            return;
        }

        const skill = await SkillModel.findById(id);
        
        if (!skill) {
            res.status(404).json({ message: 'Skill not found' });
            return;
        }
        
        res.status(200).json({ 
            message: 'Skill retrieved successfully', 
            skill 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving the skill';
        res.status(500).json({ error: errorMessage });
    }
};

// POST /api/skills - Create new skill (ADMIN ONLY)
export const createSkill = async (req: TypedRequest<ISkillBody>, res: Response) => {
    try {
        const { name, level, category, icon, order } = req.body;
        
        if (!name || !level || !category) {
            res.status(400).json({ message: 'Name, level, and category are required' });
            return;
        }

        const newSkill = await SkillModel.create({
            name,
            level,
            category,
            icon,
            order
        });

        res.status(201).json({
            message: 'Skill created successfully',
            skill: {
                id: newSkill._id,
                name: newSkill.name,
                level: newSkill.level,
                category: newSkill.category,
                icon: newSkill.icon,
                order: newSkill.order
            }
        });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the skill';
        res.status(400).json({ error: errorMessage });
    }
};

// PUT /api/skills/:id - Update skill (ADMIN ONLY)
export const updateSkill = async (req: Request, res: Response) => {
    try {
        const skill = await SkillModel.findById(req.params.id);
        if (!skill) {
            res.status(404).json({ message: 'Skill not found' });
            return;
        }

        const { name, level, category, icon, order } = req.body;

        skill.name = name ?? skill.name;
        skill.level = level ?? skill.level;
        skill.category = category ?? skill.category;
        skill.icon = icon ?? skill.icon;
        skill.order = order ?? skill.order;

        await skill.save();
        res.json({ message: 'Skill updated successfully', skill });
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the skill';
        res.status(400).json({ error: errorMessage });
    }
};

// DELETE /api/skills/:id - Delete skill (ADMIN ONLY)
export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const skill = await SkillModel.findById(req.params.id);
        if (!skill) {
            res.status(404).json({ message: 'Skill not found' });
            return;
        }
        
        await SkillModel.findByIdAndDelete(req.params.id);
        
        return res.json({ message: 'Skill deleted successfully' });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the skill';
        res.status(500).json({ error: errorMessage });
    }
};

export default {
    getAllSkills,
    getGroupedSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill
};