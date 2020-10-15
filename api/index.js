const express = require('express');
const userRouter  = require('./resources/users');
const authRouter  = require('./resources/auth');
const giftcardRouter = require('./resources/giftcard');
const cryptocurrencyRouter = require('./resources/cryptocurrency');
const classRouter = require('./resources/class');
const saleRouter = require('./resources/sell');

const restRouter = express.Router();

module.exports =  restRouter;

restRouter.use('/users', userRouter);
restRouter.use('/authenticate', authRouter);
restRouter.use('/giftcards', giftcardRouter);
restRouter.use('/cryptocurrencies', cryptocurrencyRouter);
restRouter.use('/sales', saleRouter);
restRouter.use('/class', classRouter);