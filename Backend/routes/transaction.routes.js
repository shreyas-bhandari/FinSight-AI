const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transaction.controller');

const validate = require('../middleware/validate');
const transactionValidation = require('../validations/transaction.validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure transaction routes

router
  .route('/')
  .get(validate(transactionValidation.getTransactions), getTransactions)
  .post(validate(transactionValidation.createTransaction), createTransaction);

router
  .route('/:id')
  .get(getTransaction)
  .put(validate(transactionValidation.updateTransaction), updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
