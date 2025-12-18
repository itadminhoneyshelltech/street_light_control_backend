import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const lightController: {
    getLights: (req: AuthRequest, res: Response) => Promise<void>;
    getLightDetail: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCitySummary: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    controlLight: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateLightStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getLightsForMap: (req: AuthRequest, res: Response) => Promise<void>;
};
//# sourceMappingURL=lightController.d.ts.map