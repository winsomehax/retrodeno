import { readJsonFile, writeJsonFile, PATHS } from '../middleware/fileOps.js'; // Assuming fileOps.js is also ESM
import { AppError } from '../middleware/errorHandler.js';

class GameController {
  constructor() {
    this.getGames = this.getGames.bind(this);
    this.createGame = this.createGame.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.deleteGame = this.deleteGame.bind(this);
    this.updateCover = this.updateCover.bind(this);
  }

  async getGames(req, res, next) {
    try {
      const [gamesJson, platformsJson] = await Promise.all([
        readJsonFile(PATHS.GAMES),
        readJsonFile(PATHS.PLATFORMS)
      ]);

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100)); // Increased cap and default if not provided
      const search = (req.query.search || '').toLowerCase();
      const platformFilter = req.query.platform;
      
      let games = Object.entries(gamesJson).map(([id, game]) => {
        const platformDetails = {};
        Object.keys(game.platforms || {}).forEach(pid => {
          if (platformsJson[pid]) {
            platformDetails[pid] = {
              name: platformsJson[pid].name || '',
              release_year: platformsJson[pid].release_year || ''
            };
          }
        });

        // Ensure all required fields exist with defaults
        return {
          id,
          title: game.title || '',
          description: game.description || '',
          cover_image_path: game.cover_image_path || '',
          platforms: game.platforms || {},
          platformDetails,
          created_at: game.created_at || new Date().toISOString(),
          updated_at: game.updated_at || new Date().toISOString()
        };
      });

      // Apply filters
      if (search) {
        games = games.filter(game => 
          game.title.toLowerCase().includes(search) ||
          game.description.toLowerCase().includes(search)
        );
      }

      if (platformFilter) {
        games = games.filter(game => 
          game.platforms && game.platforms[platformFilter]
        );
      }

      // Sort by title by default
      games.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

      const total = games.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedGames = games.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedGames,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: endIndex < total
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async createGame(req, res, next) {
    try {
      const game = req.body;
      const gamesJson = await readJsonFile(PATHS.GAMES);
      
      const key = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
      if (gamesJson[key]) {
        throw new AppError('Game already exists', 400);
      }

      const newGameData = {
        ...game,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      gamesJson[key] = newGameData;

      await writeJsonFile(PATHS.GAMES, gamesJson);
      // Ensure the response data includes the 'id' which is the key
      const responseData = { ...newGameData, id: key };
      res.status(201).json({
        success: true,
        data: responseData
      });
    } catch (err) {
      next(err);
    }
  }

  async updateGame(req, res, next) {
    try {
      // Assuming the route in app.js is '/api/games/:gameId', where gameId is the game's unique key.
      const { gameId } = req.params;
      const updatedGame = req.body;
      const gamesJson = await readJsonFile(PATHS.GAMES);

      // Use gameId directly as the key if games.json is keyed by these identifiers
      if (!gamesJson[gameId]) {
        const errorMessage = `Game not found with identifier: "${gameId}"`;
        throw new AppError(errorMessage, 404);
      }

      const gameDataToSave = {
        ...updatedGame,
        updated_at: new Date().toISOString(),
        created_at: gamesJson[gameId].created_at // Preserve original creation date
      };
      gamesJson[gameId] = gameDataToSave;

      await writeJsonFile(PATHS.GAMES, gamesJson);
      const responseData = { ...gameDataToSave, id: gameId };

      res.json({
        success: true,
        data: responseData
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteGame(req, res, next) {
    try {
      // Assuming the route in app.js is '/api/games/:gameId', where gameId is the game's unique key.
      const { gameId } = req.params;
      const gamesJson = await readJsonFile(PATHS.GAMES);

      if (!gamesJson[gameId]) {
        throw new AppError('Game not found', 404);
      }

      delete gamesJson[gameId];
      await writeJsonFile(PATHS.GAMES, gamesJson);
      res.json({
        success: true,
        message: `Game ${gameId} deleted successfully`
      });
    } catch (err) {
      next(err);
    }
  }

  // Assumes route like PUT /api/games/:gameId/cover
  async updateCover(req, res, next) {
    try {
      const { gameId } = req.params;
      const { imageUrl } = req.body;
      const gamesJson = await readJsonFile(PATHS.GAMES);

      if (!gamesJson[gameId]) {
        throw new AppError('Game not found', 404);
      }

      gamesJson[gameId].cover_image_path = imageUrl;
      gamesJson[gameId].updated_at = new Date().toISOString();

      await writeJsonFile(PATHS.GAMES, gamesJson);
      res.json({
        success: true,
        data: gamesJson[gameId]
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new GameController();
