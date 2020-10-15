const express = require('express');
const authController = require('../users/user.controller');
const upload = require('../users/multer');
const passport = require('passport');
const { protect } = require('../users/auth');

const authRouter = express.Router();
module.exports = authRouter;

authRouter.route('/').get(protect,authController.getMe);