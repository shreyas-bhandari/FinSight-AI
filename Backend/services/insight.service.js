const Transaction = require('../models/Transaction');

class InsightService {
  async getMonthlySummary(userId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const matchStage = {
      userId,
      date: { $gte: start, $lte: end }
    };

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      { 
        $group: { 
          _id: '$type', 
          total: { $sum: '$amount' }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach(item => {
      if (item._id === 'income') income = item.total;
      if (item._id === 'expense') expense = item.total;
    });

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      income,
      expense,
      savings: income - expense,
      savingsRate: Number(savingsRate.toFixed(2))
    };
  }

  async getCategoryBreakdown(userId, year, month, type = 'expense') {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          type,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
  }

  async getSpendingTrends(userId, months = 6) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$date' }, 
            month: { $month: '$date' } 
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }
}

module.exports = new InsightService();
