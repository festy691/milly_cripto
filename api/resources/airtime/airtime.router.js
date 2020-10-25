const express = require('express');
const airtimeController = require('./airtime.controller');
const upload = require('./multer');
const { protect, authorize } = require('../users/auth');

const airtimeRouter = express.Router();
module.exports = airtimeRouter;

airtimeRouter.route('/')
.post(protect, upload.single('image'),airtimeController.buyAirtime)
.get(protect, authorize('admin'), airtimeController.getAllSales);

airtimeRouter.route('/mine/:id')
.get(protect, airtimeController.getAllMine);

airtimeRouter.route('/:id')
.put(protect, authorize('admin'), upload.single('image'), airtimeController.updateSale)
.get(protect, airtimeController.getOneSale)
.delete(protect, airtimeController.deleteSale);

airtimeRouter.route('/search/:status')
.get(protect, authorize('admin'), airtimeController.getsalesStatus);