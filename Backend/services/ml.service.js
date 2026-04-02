const axios = require('axios');

class MLService {
  constructor() {
    this.apiUrl = process.env.ML_API_URL || 'http://ml-service:5001/api/ml';
  }

  async predictExpense(userId, recentTransactions) {
    try {
      const response = await axios.post(`${this.apiUrl}/predict-expense`, {
        userId,
        transactions: recentTransactions
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Error [predictExpense]:', error.message);
      // Fallback response if ML service is down
      return { status: 'fallback', predictedExpense: 0, message: 'Prediction currently unavailable' };
    }
  }

  async analyzeBehavior(userId, transactions) {
    try {
      const response = await axios.post(`${this.apiUrl}/behavior-analysis`, {
        userId,
        transactions
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Error [analyzeBehavior]:', error.message);
      return { status: 'fallback', alerts: [], insights: [] };
    }
  }

  async predictGoalSuccess(goalDetails, userHistory) {
    try {
      const response = await axios.post(`${this.apiUrl}/goal-prediction`, {
        goal: goalDetails,
        history: userHistory
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Error [predictGoalSuccess]:', error.message);
      return { status: 'fallback', probability: 50, recommendations: ['Keep saving consistently'] };
    }
  }
}

module.exports = new MLService();
