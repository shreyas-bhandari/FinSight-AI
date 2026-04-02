const Joi = require('joi');

const createGoal = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    targetAmount: Joi.number().required().min(1),
    currentAmount: Joi.number().min(0),
    deadline: Joi.date().iso().required(),
  }),
};

const updateGoal = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    targetAmount: Joi.number().min(1),
    currentAmount: Joi.number().min(0),
    deadline: Joi.date().iso(),
  }).min(1),
};

module.exports = {
  createGoal,
  updateGoal,
};
