const insightService = require('./insight.service');
const mlService = require('./ml.service');
const Transaction = require('../models/Transaction');

class SmartService {
  async detectLifestyleInflation(userId) {
    const now = new Date();
    // Get this month and last month
    const thisMonth = await insightService.getMonthlySummary(userId, now.getFullYear(), now.getMonth() + 1);
    
    // Last month
    let prevYear = now.getFullYear();
    let prevMonth = now.getMonth(); 
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const lastMonth = await insightService.getMonthlySummary(userId, prevYear, prevMonth);

    let warnings = [];

    // Inflation check
    if (lastMonth.income > 0 && thisMonth.income > lastMonth.income) {
      const incomeGrowth = (thisMonth.income - lastMonth.income) / lastMonth.income;
      if (lastMonth.expense > 0) {
        const expenseGrowth = (thisMonth.expense - lastMonth.expense) / lastMonth.expense;
        
        if (expenseGrowth > incomeGrowth) {
          warnings.push(`Lifestyle Inflation Warning: Your expenses grew by ${(expenseGrowth * 100).toFixed(1)}% while income only grew by ${(incomeGrowth * 100).toFixed(1)}%.`);
        }
      }
    }

    return { checked: true, warnings };
  }

  async runBehaviorAnalysis(userId) {
    // Fetch last 30 days of transactions
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: start }
    }).select('amount category date type -_id');

    // Call ML service
    const mlAnalysis = await mlService.analyzeBehavior(userId, transactions);

    // Combine with local smart alerts
    const localAlerts = this.generateSmartAlerts(transactions);

    return {
      mlInsights: mlAnalysis,
      localAlerts
    };
  }

  generateSmartAlerts(transactions) {
    const alerts = [];
    // Basic local heuristic: Spike in a single day
    const dailyTotals = {};
    let totalExpense = 0;
    let expenseCount = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const day = t.date.toISOString().split('T')[0];
        dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
        totalExpense += t.amount;
        expenseCount++;
      }
    });

    const avgDaily = expenseCount > 0 ? (totalExpense / Object.keys(dailyTotals).length) : 0;

    for (const [day, total] of Object.entries(dailyTotals)) {
      if (avgDaily > 0 && total > avgDaily * 3) {
        alerts.push(`High spending alert on ${day}: Amount ${total} is > 3x your daily average of ${avgDaily.toFixed(2)}.`);
      }
    }

    return alerts;
  }
}

module.exports = new SmartService();
