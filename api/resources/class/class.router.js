const express = require('express');
const categoryController = require('./class.controller');
const upload = require('./multer');
const { protect, authorize } = require('../users/auth');

const categoryRouter = express.Router();
module.exports = categoryRouter;

categoryRouter.route('/')
.post(protect, authorize('admin'), upload.single('image'),categoryController.createClass)
.get(categoryController.getAllclass);

categoryRouter.route('/:id')
.put(protect, authorize('admin'), upload.single('image'), categoryController.updateClass)
.get(categoryController.getOneClass)
.delete(protect, authorize('admin'), categoryController.deleteClass);