import Contact from '../models/Contacts';
import { Request, Response, NextFunction } from 'express';

interface IContactBody {
    name: string;
    email: string;
    subject?: string;
    message: string;
}

type TypedRequest<T = {}> = Request<{}, any, T>;

export const getAllContacts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 5, unreadOnly = 'false' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        
        // Optional filter for unread only
        const filter: any = unreadOnly === 'true' ? { isRead: false } : {};
        
        const totalDocuments = await Contact.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / Number(limit));
        
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        
        res.status(200).json({ 
            message: 'Contacts retrieved successfully',
            totalPages, 
            totalDocuments,
            page: Number(page), 
            limit: Number(limit), 
            contacts 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving contacts';
        res.status(500).json({ error: errorMessage });
    }
};

export const getContactById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if id exists and validate MongoDB ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ message: 'Invalid contact ID format' });
            return;
        }

        const contact = await Contact.findById(id);
        
        if (!contact) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }
        
        // Auto-mark as read when viewed (optional enhancement)
        if (!contact.isRead) {
            contact.isRead = true;
            await contact.save();
        }
        
        res.status(200).json({ 
            message: 'Contact retrieved successfully', 
            contact 
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while retrieving the contact';
        res.status(500).json({ error: errorMessage });
    }
};

export const createContact = async (req: TypedRequest<IContactBody>, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ message: 'Name, email, and message are required' });
            return;
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            message: 'Contact submitted successfully',
            contact: {
                id: newContact._id,
                name: newContact.name,
                email: newContact.email,
                subject: newContact.subject,
                message: newContact.message,
                isRead: newContact.isRead
            }
        });
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the contact';
        res.status(400).json({ error: errorMessage });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }

        const { isRead } = req.body;

        if (isRead !== undefined) {
            contact.isRead = isRead;
        }

        await contact.save();
        res.json({ message: 'Contact updated successfully', contact });
    
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the contact';
        res.status(400).json({ error: errorMessage });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }
        
        await Contact.findByIdAndDelete(req.params.id);
        
        return res.json({ message: 'Contact deleted successfully' });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the contact';
        res.status(500).json({ error: errorMessage });
    }
};

// At the end of contactController.ts
export default {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};