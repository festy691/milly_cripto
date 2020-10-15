const express = require('express');
const cryptocurrencyController = require('./cryptocurrency.controller');
const upload = require('./multer');
const { protect, authorize } = require('../users/auth');

const cryptocurrencyRouter = express.Router();
module.exports = cryptocurrencyRouter;

cryptocurrencyRouter.route('/')
.post(protect, authorize('admin'), upload.single('image'), cryptocurrencyController.createCrypto)
.get(cryptocurrencyController.getAllCrypto);

cryptocurrencyRouter.route('/:id')
.put(protect, authorize('admin'), upload.single('image'), cryptocurrencyController.updateCrypto)
.get(cryptocurrencyController.getOneCrypto)
.delete(protect, authorize('admin'), cryptocurrencyController.deleteCrypto);