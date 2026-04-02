const insightService = require('../services/insight.service');
const smartService = require('../services/smart.service');

// @desc    Get monthly summary
// @route   GET /api/insights/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const summary = await insightService.getMonthlySummary(req.user.id, targetYear, targetMonth);

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category breakdown
// @route   GET /api/insights/categories
// @access  Private
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { year, month, type } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetType = type || 'expense';

    const breakdown = await insightService.getCategoryBreakdown(req.user.id, targetYear, targetMonth, targetType);

    res.status(200).json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
};

// @desc    Get spending trends
// @route   GET /api/insights/trends
// @access  Private
exports.getTrends = async (req, res, next) => {
  try {
    const { months } = req.query;
    const targetMonths = months ? parseInt(months) : 6;

    const trends = await insightService.getSpendingTrends(req.user.id, targetMonths);

    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
};

// @desc    Get smart behavior analysis & lifestyle inflation warnings
// @route   GET /api/insights/smart-analysis
// @access  Private
exports.getSmartAnalysis = async (req, res, next) => {
  try {
    const inflationData = await smartService.detectLifestyleInflation(req.user.id);
    const behaviorData = await smartService.runBehaviorAnalysis(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        inflation: inflationData,
        behavior: behaviorData
      }
    });
  } catch (err) {
    next(err);
  }
};
