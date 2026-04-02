const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validations/user.validation');

const router = express.Router();

router.post('/register', validate(authValidation.register), register);
router.post('/login', validate(authValidation.login), login);

module.exports = router;
