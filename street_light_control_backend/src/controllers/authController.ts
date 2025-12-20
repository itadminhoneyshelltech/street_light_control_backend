import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  register: async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, city, role = 'viewer' } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        city,
        role,
      });

      await user.save();
      const token = generateToken(user._id.toString(), user.email, user.role, user.city);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString(), user.email, user.role, user.city);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  },
};
