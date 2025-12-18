import { Response, NextFunction } from 'express';
export interface AuthRequest extends Express.Request {
    userId?: string;
    user?: {
        id: string;
        email: string;
        role: string;
        city: string;
    };
}
export declare const generateToken: (userId: string, email: string, role: string, city: string) => string;
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const roleMiddleware: (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map