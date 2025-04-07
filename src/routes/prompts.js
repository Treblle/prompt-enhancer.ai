const express = require('express');
const promptsController = require('../controllers/prompts');
const { authenticateToken } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../middleware/security');

const router = express.Router();

// Add timeout to all routes
router.use((req, res, next) => {
  req.setTimeout(90000);  // 90 seconds
  res.setTimeout(90000);  // 90 seconds
  next();
});

// POST /prompts - Create a new enhanced prompt
router.post('/', authenticateToken, rateLimitMiddleware(), promptsController.enhancePrompt);

// GET /prompts - List enhanced prompts
router.get('/', authenticateToken, rateLimitMiddleware(), promptsController.listPrompts);

// GET /prompts/:id - Get a specific prompt
router.get('/:id', authenticateToken, rateLimitMiddleware(), promptsController.getPrompt);

// PUT /prompts/:id - Update a prompt
router.put('/:id', authenticateToken, rateLimitMiddleware(), promptsController.updatePrompt);

// DELETE /prompts/:id - Delete a prompt
router.delete('/:id', authenticateToken, rateLimitMiddleware(), promptsController.deletePrompt);

module.exports = router;