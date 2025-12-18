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
//# sourceMappingURL=User.d.ts.map