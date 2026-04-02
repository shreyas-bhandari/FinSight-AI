const Joi = require('joi');

const createTransaction = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    description: Joi.string().max(200).allow(''),
    date: Joi.date().iso() // Optional, defaults to now in schema if missing
  }),
};

const updateTransaction = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number(),
    type: Joi.string().valid('income', 'expense'),
    category: Joi.string(),
    description: Joi.string().max(200).allow(''),
    date: Joi.date().iso()
  }).min(1), // At least one field to update
};

const getTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid('income', 'expense'),
    category: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

module.exports = {
  createTransaction,
  updateTransaction,
  getTransactions
};
