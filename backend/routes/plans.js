const express = require('express');
const {
    generatePlan,
    getActivePlan,
    markSessionComplete,
    regeneratePlan,
} = require('../controllers/planController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', protect, generatePlan);
router.post('/regenerate', protect, regeneratePlan);
router.get('/active', protect, getActivePlan);
router.put('/:planId/sessions/:sessionId/complete', protect, markSessionComplete);

module.exports = router;
