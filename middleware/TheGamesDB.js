const apiKey = Deno.env.get("THEGAMESDB_API_KEY");
const baseUrl = 'https://api.thegamesdb.net/v1';

/**
 * @param {string} gameName - The name of the game to search for.
 * @returns {Promise<Array>} - A promise that resolves to an array of games.
 */
export async function searchGames(gameName) {
  try {
    if (!apiKey) {
      throw new AppError('THEGAMESDB_API_KEY is not set in environment variables.', 500);
    }
    const params = new URLSearchParams({
      apikey: apiKey,
      name: gameName,
      fields: 'platform,players,genres,publishers,developers,overview,rating,release_date',
      include: 'boxart' // Request boxart images
    });
    const url = `${baseUrl}/Games/ByGameName?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(`TheGamesDB request failed with status code ${response.status}: ${errorText}`, response.status);
    }

    const parsedData = await response.json();
    const gamesFromApi = parsedData.data.games || [];
    const includeBoxartData = parsedData.include?.boxart?.data;
    const boxartBaseUrls = parsedData.include?.boxart?.base_url; // e.g., { original, small, thumb, large, ... }

    const processedGames = gamesFromApi.map(game => {
      // Ensure game.id is a string for object key lookup if necessary, though numbers usually work.
      const gameSpecificBoxartArray = includeBoxartData ? includeBoxartData[String(game.id)] : null;
      let largeBoxartUrl = null;
      let thumbBoxartUrl = null;

      if (gameSpecificBoxartArray && Array.isArray(gameSpecificBoxartArray) && boxartBaseUrls) {
        // Prefer front boxart of type 'boxart'
        let chosenBoxart = gameSpecificBoxartArray.find(art => art.type === 'boxart' && art.side === 'front');
        
        // Fallback to any 'boxart' type if front is not found
        if (!chosenBoxart) {
          chosenBoxart = gameSpecificBoxartArray.find(art => art.type === 'boxart');
        }
        // Fallback to the first image if no 'boxart' type is found
        if (!chosenBoxart && gameSpecificBoxartArray.length > 0) {
          chosenBoxart = gameSpecificBoxartArray[0];
        }

        if (chosenBoxart && chosenBoxart.filename) {
          if (boxartBaseUrls.large) {
            largeBoxartUrl = boxartBaseUrls.large + chosenBoxart.filename;
          }
          if (boxartBaseUrls.thumb) { 
            thumbBoxartUrl = boxartBaseUrls.thumb + chosenBoxart.filename;
          }
        }
      }
      return {
        ...game,
        boxart_large_url: largeBoxartUrl,
        boxart_thumb_url: thumbBoxartUrl,
        boxart: gameSpecificBoxartArray || [], // Keep original boxart array for potential other uses
      };
    });

    return {
      games: processedGames,
      // The legacy imageBaseUrl is less relevant now for boxart, but kept for potential other uses or backward compatibility.
      imageBaseUrl: parsedData.include?.boxart?.base_url_legacy || 'https://legacy.thegamesdb.net/banners/'
    };

  } catch (error) {
    console.error('Error searching games on TheGamesDB:', error);
    // If it's not an AppError already, wrap it or rethrow
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to search games on TheGamesDB.', 500);
  }
}
/**
 * @param {number} gameId - The ID of the game to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the game details.
 */
export async function getGameDetails(gameId) {
  try {
    if (!apiKey) {
      throw new AppError('THEGAMESDB_API_KEY is not set in environment variables.', 500);
    }
    const params = new URLSearchParams({
      apikey: apiKey,
      id: String(gameId), // Ensure id is a string for URLSearchParams
    });
    const url = `${baseUrl}/Games/ByGameID?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(`TheGamesDB request for game details failed with status code ${response.status}: ${errorText}`, response.status);
    }

    const parsedData = await response.json();
    return parsedData.data.game; // Assuming this is the structure

  } catch (error) {
    console.error(`Error retrieving game details for ID ${gameId} from TheGamesDB:`, error);
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to retrieve game details for ID ${gameId} from TheGamesDB.`, 500);
  }
}

// If app.js imports this as `import theGamesDB from '...'` and expects an object:
export default { searchGames, getGameDetails };

//module.exports = { searchGames, getGameDetails };