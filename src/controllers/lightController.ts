import { Response } from 'express';
import { StreetLight } from '../models/StreetLight';
import { CitySummary } from '../models/CitySummary';
import { ControlLog } from '../models/ControlLog';
import { AuthRequest } from '../middleware/auth';

export const lightController = {
  // Get all lights for a city
  getLights: async (req: AuthRequest, res: Response) => {
    try {
      const { city } = req.query;
      const userCity = req.user?.city;

      const query: any = {};
      if (city) query.city = city;
      else if (userCity) query.city = userCity;

      const lights = await StreetLight.find(query).sort({ name: 1 });
      res.json(lights);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lights' });
    }
  },

  // Get single light details
  getLightDetail: async (req: AuthRequest, res: Response) => {
    try {
      const { lightId } = req.params;
      const light = await StreetLight.findOne({ lightId });

      if (!light) {
        return res.status(404).json({ error: 'Light not found' });
      }

      const logs = await ControlLog.find({ lightId }).sort({ createdAt: -1 }).limit(10);

      res.json({ light, recentLogs: logs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch light details' });
    }
  },

  // Get city summary/statistics
  getCitySummary: async (req: AuthRequest, res: Response) => {
    try {
      const { city } = req.query;
      const userCity = req.user?.city;

      const summary = await CitySummary.findOne({
        city: city || userCity,
      });

      if (!summary) {
        return res.status(404).json({ error: 'No data for this city' });
      }

      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  },

  // Control light (turn on/off)
  controlLight: async (req: AuthRequest, res: Response) => {
    try {
      const { lightId, action } = req.body; // action: 'on' or 'off'
      const userRole = req.user?.role;

      // Check permissions
      if (userRole === 'viewer') {
        return res.status(403).json({ error: 'Viewers cannot control lights' });
      }

      const light = await StreetLight.findOne({ lightId });
      if (!light) {
        return res.status(404).json({ error: 'Light not found' });
      }

      const previousStatus = light.status;
      light.status = action === 'on' ? 'on' : 'off';
      light.lastStatusChange = new Date();
      light.isAutomatic = false; // Manual control disables automatic

      await light.save();

      // Log the control action
      await ControlLog.create({
        lightId,
        action,
        performedBy: req.user?.email || 'unknown',
        userId: req.user?.id,
        controlType: 'manual',
        previousStatus,
        newStatus: light.status,
      });

      // Update city summary
      await updateCitySummary(light.city);

      res.json({
        message: `Light turned ${action}`,
        light: light.toObject(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to control light' });
    }
  },

  // Report/update light status (from devices/sensors)
  updateLightStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { lightId, status, errorDetails } = req.body;

      const light = await StreetLight.findOne({ lightId });
      if (!light) {
        return res.status(404).json({ error: 'Light not found' });
      }

      const previousStatus = light.status;
      light.status = status; // 'on', 'off', or 'error'
      light.errorDetails = errorDetails;
      light.lastStatusChange = new Date();

      await light.save();

      if (previousStatus !== status) {
        await ControlLog.create({
          lightId,
          action: status,
          performedBy: 'System',
          controlType: 'automatic',
          previousStatus,
          newStatus: status,
          reason: errorDetails || 'Automated status update',
        });

        await updateCitySummary(light.city);
      }

      res.json({
        message: 'Light status updated',
        light: light.toObject(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update light status' });
    }
  },

  // Get all lights with their locations for map
  getLightsForMap: async (req: AuthRequest, res: Response) => {
    try {
      const { city } = req.query;
      const userCity = req.user?.city;

      const query: any = { city: city || userCity };
      const lights = await StreetLight.find(query, {
        lightId: 1,
        name: 1,
        location: 1,
        status: 1,
      });

      res.json(lights);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch map data' });
    }
  },
};

// Helper function to update city summary
async function updateCitySummary(city: string) {
  try {
    const lights = await StreetLight.find({ city });
    const lightsOn = lights.filter((l) => l.status === 'on').length;
    const lightsOff = lights.filter((l) => l.status === 'off').length;
    const lightsInError = lights.filter((l) => l.status === 'error').length;

    await CitySummary.findOneAndUpdate(
      { city },
      {
        totalLights: lights.length,
        lightsOn,
        lightsOff,
        lightsInError,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to update city summary:', error);
  }
}
