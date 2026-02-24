const express = require('express');
const router = express.Router();
const { getProfile, upsertProfile, updateResumeText } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(protect);

router.get('/', getProfile);
router.post('/', validate(schemas.profile), upsertProfile);
router.put('/resume-text', updateResumeText);

module.exports = router;
