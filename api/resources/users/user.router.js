const express = require('express');
const userController = require('./user.controller');
const upload = require('./multer');
const { protect, authorize } = require('./auth');
//const isAdmin = require('./authorization');

const userRouter = express.Router();
module.exports = userRouter;

//const adminPolicy = [passport.authenticate('jwt',{session:false}), isAdmin];
//const userPolicy = passport.authenticate('jwt',{session:false});

userRouter.route('/')
.post(upload.single('image'),userController.createUser)
.get(protect, authorize('admin'), userController.getAllUsers);

userRouter.route('/:id')
.put(protect,upload.single('image'),userController.updateUser)
.get(protect,userController.getSingleUser)
.delete(protect,userController.deleteUser);

userRouter.route('/login').post(userController.loginUser);

userRouter.route('/cashout').post(protect, authorize('admin'), userController.cashout);

userRouter.route('/credit/:id').put(protect, authorize('admin'), userController.addMoney);

userRouter.route('/logout').post(protect,userController.logoutUser);

userRouter.route('/updatepassword/:id').put(protect,userController.updatePassword);

userRouter.route('/verifyemail').post(userController.getVerificationMail);

userRouter.route('/forgotpassword').post(upload.single('image'),userController.forgotPassword);

userRouter.route('/resetpassword').post(userController.resetPassword);

userRouter.route('/me').get(protect,userController.getMe);

userRouter.route('/activate').post(userController.verifyUserToken);

userRouter.route('/myid/:id').get(protect, userController.getIdFromToken);