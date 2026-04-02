const express = require('express');
const { getProfile, updateProfile, deleteAccount } = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const userValidation = require('../validations/user.validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes below are protected

router.get('/profile', getProfile);
router.put('/update', validate(userValidation.updateProfile), updateProfile);
router.delete('/account', deleteAccount);

module.exports = router;
