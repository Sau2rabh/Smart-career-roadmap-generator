const express = require('express');
const router = express.Router();
const { getProgress, claimXP } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProgress);
router.post('/claim-xp', claimXP);

module.exports = router;
