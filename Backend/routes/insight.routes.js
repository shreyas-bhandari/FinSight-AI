const express = require('express');
const {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getSmartAnalysis
} = require('../controllers/insight.controller');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getTrends);
router.get('/smart-analysis', getSmartAnalysis);

module.exports = router;
