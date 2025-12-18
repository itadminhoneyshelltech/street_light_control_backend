"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lightController_1 = require("../controllers/lightController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// View routes - available to all authenticated users
router.get('/list', lightController_1.lightController.getLights);
router.get('/detail/:lightId', lightController_1.lightController.getLightDetail);
router.get('/summary', lightController_1.lightController.getCitySummary);
router.get('/map', lightController_1.lightController.getLightsForMap);
// Control routes - only admin and operator
router.post('/control', (0, auth_1.roleMiddleware)(['admin', 'operator']), lightController_1.lightController.controlLight);
// Update status - typically from devices
router.post('/update-status', lightController_1.lightController.updateLightStatus);
exports.default = router;
//# sourceMappingURL=lightRoutes.js.map