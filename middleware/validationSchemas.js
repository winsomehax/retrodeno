import { body, param } from "npm:express-validator";

export const gameValidation = {
  create: [
    body('title')
      .exists()
      .withMessage('Title field is required')
      .notEmpty()
      .withMessage('Game title cannot be empty')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('cover_image_path')
      .optional()
      .isString()
      .withMessage('Cover image path must be a string')
      .trim()
      .isURL()
      .withMessage('Cover image path must be a valid URL'),
    body('platforms')
      .optional()
      .isObject()
      .withMessage('Platforms must be an object')
  ],

  update: [
    param('gameId') // Changed from 'title' to 'gameId'
      .exists()
      .withMessage('Game ID route parameter is required')
      .notEmpty()
      .withMessage('Game ID route parameter cannot be empty')
      .trim()
      .escape(),
    body('title')
      .exists()
      .withMessage('Title field is required')
      .notEmpty()
      .withMessage('Game title cannot be empty')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('cover_image_path')
      .optional()
      .isString()
      .withMessage('Cover image path must be a string')
      .trim()
      .isURL()
      .withMessage('Cover image path must be a valid URL'),
    body('platforms')
      .optional()
      .isObject()
      .withMessage('Platforms must be an object')
  ],

  updateCover: [
    param('gameId') // Should validate the gameId from the route parameter
      .exists()
      .withMessage('Game ID route parameter is required')
      .notEmpty()
      .withMessage('Game ID route parameter cannot be empty')
      .trim()
      .escape(),
    body('imageUrl')
      .exists()
      .withMessage('Image URL is required')
      .notEmpty()
      .withMessage('Image URL cannot be empty')
      .trim()
      .isURL()
      .withMessage('A valid image URL is required')
  ],

  delete: [
    param('gameId') // Changed from 'title' to 'gameId'
      .exists()
      .withMessage('Game ID route parameter is required')
      .notEmpty()
      .withMessage('Game ID route parameter cannot be empty')
      .trim()
      .escape()
  ]
};

export const platformValidation = {
  create: [
    body('name')
      .exists()
      .withMessage('Name field is required')
      .notEmpty()
      .withMessage('Platform name cannot be empty')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('image_url')
      .optional()
      .isString()
      .withMessage('Image URL must be a string')
      .trim()
      .isURL()
      .withMessage('Image URL must be a valid URL'),
    body('release_year')
      .optional()
      .isInt({ min: 1950, max: new Date().getFullYear() })
      .withMessage(`Release year must be between 1950 and ${new Date().getFullYear()}`),
    body('emulators')
      .optional()
      .isArray()
      .withMessage('Emulators must be an array')
  ],
  
  update: [
    param('name')
      .exists()
      .withMessage('Name parameter is required')
      .notEmpty()
      .withMessage('Platform name cannot be empty')
      .trim()
      .escape(),
    body('name')
      .exists()
      .withMessage('Name field is required')
      .notEmpty()
      .withMessage('Platform name cannot be empty')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('image_url')
      .optional()
      .isString()
      .withMessage('Image URL must be a string')
      .trim()
      .isURL()
      .withMessage('Image URL must be a valid URL'),
    body('release_year')
      .optional()
      .isInt({ min: 1950, max: new Date().getFullYear() })
      .withMessage(`Release year must be between 1950 and ${new Date().getFullYear()}`),
    body('emulators')
      .optional()
      .isArray()
      .withMessage('Emulators must be an array')
  ],

  updateImage: [
    body('pid')
      .exists()
      .withMessage('Platform ID is required')
      .notEmpty()
      .withMessage('Platform ID cannot be empty')
      .trim(),
    body('imageUrl')
      .exists()
      .withMessage('Image URL is required')
      .notEmpty()
      .withMessage('Image URL cannot be empty')
      .trim()
      .isURL()
      .withMessage('A valid image URL is required')
  ],

  delete: [
    param('name')
      .exists()
      .withMessage('Name parameter is required')
      .notEmpty()
      .withMessage('Platform name cannot be empty')
      .trim()
      .escape()
  ]
};

export const emulatorValidation = {
  create: [
    body('platformId')
      .exists()
      .withMessage('Platform ID is required')
      .notEmpty()
      .withMessage('Platform ID cannot be empty')
      .trim(),
    body('emulator.emulator_id')
      .exists()
      .withMessage('Emulator ID is required')
      .notEmpty()
      .withMessage('Emulator ID cannot be empty')
      .trim(),
    body('emulator.name')
      .exists()
      .withMessage('Emulator name is required')
      .notEmpty()
      .withMessage('Emulator name cannot be empty')
      .trim()
      .escape(),
    body('emulator.description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('emulator.version')
      .optional()
      .isString()
      .withMessage('Version must be a string')
      .trim(),
    body('emulator.command')
      .optional()
      .isString()
      .withMessage('Command must be a string')
      .trim(),
    body('emulator.args')
      .optional()
      .isArray()
      .withMessage('Arguments must be an array')
  ],

  update: [
    param('platformId')
      .exists()
      .withMessage('Platform ID is required')
      .notEmpty()
      .withMessage('Platform ID cannot be empty')
      .trim(),
    param('emulatorId')
      .exists()
      .withMessage('Emulator ID is required')
      .notEmpty()
      .withMessage('Emulator ID cannot be empty')
      .trim(),
    body('emulator_id')
      .exists()
      .withMessage('Emulator ID is required')
      .notEmpty()
      .withMessage('Emulator ID cannot be empty')
      .trim(),
    body('name')
      .exists()
      .withMessage('Emulator name is required')
      .notEmpty()
      .withMessage('Emulator name cannot be empty')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .escape(),
    body('version')
      .optional()
      .isString()
      .withMessage('Version must be a string')
      .trim(),
    body('command')
      .optional()
      .isString()
      .withMessage('Command must be a string')
      .trim(),
    body('args')
      .optional()
      .isArray()
      .withMessage('Arguments must be an array')
  ]
};

export const launchValidation = {
  create: [
    body('emulatorId')
      .exists()
      .withMessage('Emulator ID is required')
      .notEmpty()
      .withMessage('Emulator ID cannot be empty')
      .trim(),
    body('platformId')
      .exists()
      .withMessage('Platform ID is required')
      .notEmpty()
      .withMessage('Platform ID cannot be empty')
      .trim(),
    body('gameTitle')
      .exists()
      .withMessage('Game title is required')
      .notEmpty()
      .withMessage('Game title cannot be empty')
      .trim(),
    body('romPath')
      .exists()
      .withMessage('ROM path is required')
      .notEmpty()
      .withMessage('ROM path cannot be empty')
      .trim()
      .custom(value => {
        if (!value.startsWith('/')) {
          throw new Error('ROM path must be absolute');
        }
        return true;
      })
  ]
};
