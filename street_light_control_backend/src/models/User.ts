// TypeScript interface for User
// Note: Using PHP/MySQL backend instead of MongoDB

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'viewer';
  city: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
