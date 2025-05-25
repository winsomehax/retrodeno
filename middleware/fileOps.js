import * as path from 'https://deno.land/std/path/mod.ts';
import { AppError } from './errorHandler.js';

// Helper to get the directory name of the current module, similar to __dirname
const currentDir = path.dirname(path.fromFileUrl(import.meta.url));
/**
 * Read and parse a JSON file
 * @param {string} filePath - Absolute path to the JSON file
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {AppError} If file not found or invalid JSON
 */
const readJsonFile = async (filePath) => {
  try {
    const data = await Deno.readTextFile(filePath);
    return JSON.parse(data);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw new AppError(`File not found: ${path.basename(filePath)}`, 404);
    }
    if (err instanceof SyntaxError) {
      throw new AppError(`Invalid JSON in ${path.basename(filePath)}`, 500);
    }
    throw new AppError('Error reading file', 500);
  }
};

/**
 * Write data to a JSON file
 * @param {string} filePath - Absolute path to the JSON file
 * @param {Object} data - Data to write
 * @throws {AppError} If write operation fails
 */
const writeJsonFile = async (filePath, data) => {
  try {
    await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2)); // Deno typically uses 2 spaces for JSON
  } catch (err) {
    throw new AppError(`Error writing to ${path.basename(filePath)}`, 500);
  }
};

/**
 * Path constants for data files
 */
const PATHS = {
  GAMES: path.join(currentDir, '../public/data/games.json'),
  PLATFORMS: path.join(currentDir, '../public/data/platforms.json'),
  EMULATORS: path.join(currentDir, '../public/data/emulators.json') // Though emulators.json doesn't seem to be used directly by controllers
};

export {
  readJsonFile,
  writeJsonFile,
  PATHS
};
