const express = require('express');
const giftcardController = require('./giftcard.controller');
const { protect, authorize } = require('../users/auth');

const giftcardRouter = express.Router();
module.exports = giftcardRouter;

giftcardRouter.route('/')
.post(protect, authorize('admin'), giftcardController.createGiftcard)
.get(giftcardController.getAllGiftcard);

giftcardRouter.route('/:id')
.put(protect, authorize('admin'), giftcardController.updateGiftcard)
.get(giftcardController.getOneGiftcard)
.delete(protect, authorize('admin'), giftcardController.deleteGiftcard);

giftcardRouter.route('/class/:id')
.get(giftcardController.getCatGiftcard);