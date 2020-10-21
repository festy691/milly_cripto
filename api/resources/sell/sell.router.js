const express = require('express');
const saleController = require('./sell.controller');
const upload = require('./multer');
const { protect, authorize } = require('../users/auth');

const saleRouter = express.Router();
module.exports = saleRouter;

saleRouter.route('/')
.post(protect, upload.single('image'),saleController.createSale)
.get(protect, authorize('admin'), saleController.getAllSales);

saleRouter.route('/mine/:id')
.get(protect, saleController.getAllMine);

saleRouter.route('/:id')
.put(protect, authorize('admin'), upload.single('image'), saleController.updateSale)
.get(protect, saleController.getOneSale)
.delete(protect, saleController.deleteSale);