const express = require('express');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  predictGoal
} = require('../controllers/goal.controller');

const validate = require('../middleware/validate');
const goalValidation = require('../validations/goal.validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getGoals)
  .post(validate(goalValidation.createGoal), createGoal);

router
  .route('/:id')
  .get(getGoal)
  .put(validate(goalValidation.updateGoal), updateGoal)
  .delete(deleteGoal);

router.get('/:id/predict', predictGoal);

module.exports = router;
