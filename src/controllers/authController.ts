import User from '../models/Users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Interfaces for request bodies (type-safe inputs)

interface RegisterBody{
    name:string 
    email:string 
    password:string
}

interface LoginBody{
    email:string 
    password:string
}


type TypedRequest<T = {}> = Request<{}, any , T>;

export const register = async (req: TypedRequest<RegisterBody>, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email, and password are required' });
            return;
        }

        // Additional validation: Email format and password length
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Please provide a valid email' });
            return;
        }

        // Check if user exists
        const activeUser = await User.findOne({ email });
        if (activeUser) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }


        if (password.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters' });
            return;
        }
        // Password hash
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Extract and guard secret (TS narrowing + runtime safety)
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'Server configuration error: JWT secret missing' });
            return;
        }

        // Generate JWT (now secret is string, matches Secret type)
        const payload = { id: newUser._id };
        const token = jwt.sign(
            payload,
            secret,  // Typed as string
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' } as jwt.SignOptions
        );

        // Response (send token, not password)
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        res.status(400).json({ error: errorMessage });
    }
};

export const login = async (req: TypedRequest<LoginBody>, res: Response) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            res.status(400).json({ message: 'Please provide your email and your password to continue.' });
            return;
        }

        // Find user by email (use findOne, not find)
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid email. Please check your credentials and try again.' });
            return;
        }

        // Password comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect password. Please try again.' });
            return;
        }

        // Extract and guard secret (TS narrowing + runtime safety)
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'Server configuration error: JWT secret missing' });
            return;
        }

        // Generate JWT
        const payload = { id: user._id };
        const token = jwt.sign(
            payload,
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' } as jwt.SignOptions
        );

        // Response (send token, NOT password)
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
                // NEVER send password in response!
            }
        });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        res.status(400).json({ error: errorMessage });
    }
};



export default {login , register};