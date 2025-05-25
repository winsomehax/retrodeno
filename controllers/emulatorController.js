import { readJsonFile, writeJsonFile, PATHS } from '../middleware/fileOps.js'; // Assuming fileOps.js is also ESM
import { AppError } from '../middleware/errorHandler.js';

class EmulatorController {
  constructor() {
    this.getEmulators = this.getEmulators.bind(this);
    this.createEmulator = this.createEmulator.bind(this);
    this.updateEmulator = this.updateEmulator.bind(this);
    this.deleteEmulator = this.deleteEmulator.bind(this);
    this.launchEmulator = this.launchEmulator.bind(this);
  }

  async getEmulators(_req, res, next) {
    try {
      const platformsJson = await readJsonFile(PATHS.PLATFORMS);
      const emulators = {};
      console.log('[Emulators BE] Starting getEmulators. platformsJson keys:', Object.keys(platformsJson));
      
      Object.entries(platformsJson).forEach(([pid, platform]) => {
        console.log(`[Emulators BE] Processing platformId: ${pid}`);
        if (Array.isArray(platform.emulators)) {
          console.log(`[Emulators BE] Found emulators array for ${pid}:`, platform.emulators.length, 'items');
          emulators[pid] = platform.emulators.map(e => ({
            // Log individual emulator structure if needed, but mapping implies it's an array
            emulator_id: e.emulator_id,
            name: e.name || e.emulator_id,
            description: e.description,
            version: e.version,
            command: e.command,
            args: e.args
          }));
        } else {
          console.log(`[Emulators BE] No emulators array or not an array for ${pid}. platform.emulators:`, platform.emulators);
          emulators[pid] = []; // Ensure platformId key exists even if no emulators
        }
      });

      console.log('[Emulators BE] Final emulators object being sent to FE:', JSON.stringify(emulators, null, 2));
      res.json({
        success: true,
        data: emulators
      });
    } catch (err) {
      next(err);
      console.error('[Emulators BE] Error in getEmulators:', err);
    }
  }

  async createEmulator(req, res, next) {
    try {
      const { platformId, emulator } = req.body;
      const platformsJson = await readJsonFile(PATHS.PLATFORMS);

      if (!platformsJson[platformId]) {
        throw new AppError('Platform not found', 404);
      }

      if (!Array.isArray(platformsJson[platformId].emulators)) {
        platformsJson[platformId].emulators = [];
      }

      if (platformsJson[platformId].emulators.find(e => e.emulator_id === emulator.emulator_id)) {
        throw new AppError('Emulator already exists for this platform', 400);
      }

      platformsJson[platformId].emulators.push({
        ...emulator,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      await writeJsonFile(PATHS.PLATFORMS, platformsJson);
      res.status(201).json({
        success: true,
        data: emulator
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEmulator(req, res, next) {
    try {
      const { platformId, emulatorId } = req.params;
      const updatedEmulator = req.body;
      const platformsJson = await readJsonFile(PATHS.PLATFORMS);

      if (!platformsJson[platformId] || !Array.isArray(platformsJson[platformId].emulators)) {
        throw new AppError('Platform or emulator configuration not found', 404);
      }

      const emulatorIndex = platformsJson[platformId].emulators.findIndex(
        e => e.emulator_id === emulatorId
      );

      if (emulatorIndex === -1) {
        throw new AppError('Emulator not found', 404);
      }

      platformsJson[platformId].emulators[emulatorIndex] = {
        ...updatedEmulator,
        updated_at: new Date().toISOString(),
        created_at: platformsJson[platformId].emulators[emulatorIndex].created_at
      };

      await writeJsonFile(PATHS.PLATFORMS, platformsJson);
      res.json({
        success: true,
        data: platformsJson[platformId].emulators[emulatorIndex]
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteEmulator(req, res, next) {
    try {
      const { platformId, emulatorId } = req.params;
      const platformsJson = await readJsonFile(PATHS.PLATFORMS);

      if (!platformsJson[platformId] || !Array.isArray(platformsJson[platformId].emulators)) {
        throw new AppError('Platform or emulator configuration not found', 404);
      }

      const emulatorIndex = platformsJson[platformId].emulators.findIndex(
        e => e.emulator_id === emulatorId
      );

      if (emulatorIndex === -1) {
        throw new AppError('Emulator not found', 404);
      }

      platformsJson[platformId].emulators.splice(emulatorIndex, 1);
      await writeJsonFile(PATHS.PLATFORMS, platformsJson);
      res.json({
        success: true,
        message: 'Emulator deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async launchEmulator(req, res, next) {
    try {
      const { emulatorId, platformId, gameTitle, romPath } = req.body;
      
      const platformsJson = await readJsonFile(PATHS.PLATFORMS);
      
      if (!platformsJson[platformId] || !Array.isArray(platformsJson[platformId].emulators)) {
        throw new AppError('Platform or emulator configuration not found', 404);
      }

      const emulator = platformsJson[platformId].emulators.find(
        e => e.emulator_id === emulatorId
      );

      if (!emulator) {
        throw new AppError('Emulator not found', 404);
      }

      console.log(`Launching emulator '${emulatorId}' for platform '${platformId}' with ROM '${romPath}' (game: '${gameTitle}')`);
      
      res.json({
        success: true,
        message: 'Emulator launch request received',
        data: {
          emulator,
          gameTitle,
          romPath
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new EmulatorController();
