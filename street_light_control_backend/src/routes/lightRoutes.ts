import { Router } from 'express';
import { lightController } from '../controllers/lightController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// View routes - available to all authenticated users
router.get('/list', lightController.getLights);
router.get('/detail/:lightId', lightController.getLightDetail);
router.get('/summary', lightController.getCitySummary);
router.get('/map', lightController.getLightsForMap);

// Control routes - only admin and operator
router.post('/control', roleMiddleware(['admin', 'operator']), lightController.controlLight);

// Update status - typically from devices
router.post('/update-status', lightController.updateLightStatus);

export default router;
