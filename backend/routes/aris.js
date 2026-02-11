const express = require('express');
const router = express.Router();
const arisController = require('../controllers/arisController');
const { protect } = require('../middleware/auth');

router.use(protect); // All ARIS routes are protected

router.post('/calculate-risk', arisController.calculateRisk);
router.post('/simulate-recovery', arisController.simulateRecovery);
router.post('/optimize-schedule', arisController.optimizeSchedule);
router.post('/adaptive-recalculate', arisController.adaptiveRecalculate);
router.get('/recovery-path', arisController.getRecoveryPath);
router.get('/ai-insights', arisController.getAIInsights);

module.exports = router;
