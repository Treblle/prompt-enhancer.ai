const express = require('express');
const promptRoutes = require('./promptRoutes');

const router = express.Router();

router.use('/prompts', promptRoutes);

module.exports = router;
