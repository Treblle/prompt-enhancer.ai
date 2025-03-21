const express = require('express');
const promptsController = require('../controllers/prompts');

const router = express.Router();

// POST /prompts - Create a new enhanced prompt
router.post('/', promptsController.enhancePrompt);

// GET /prompts - List enhanced prompts
router.get('/', promptsController.listPrompts);

// GET /prompts/:id - Get a specific prompt
router.get('/:id', promptsController.getPrompt);

// PUT /prompts/:id - Update a prompt
router.put('/:id', promptsController.updatePrompt);

// DELETE /prompts/:id - Delete a prompt
router.delete('/:id', promptsController.deletePrompt);

module.exports = router;