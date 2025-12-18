import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=authController.d.ts.map