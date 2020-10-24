const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

var UserSchema = new mongoose.Schema({
 
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    image : {
        type : String,
        default : null
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phonenumber : {
        type : String
    },
    bankname : {
        type : String
    },
    accountname : {
        type : String
    },
    accountnumber : {
        type : String
    },
    walletbalance : {
        type : Number,
        default: 0.0
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    resetPasswordToken : {
        type : String
    },
    resetPassordExpire : {
        type : Date
    },
    date : {
        type : Date,
        default : Date.now()
    },
    level : {
        type : String,
        default : 'user',
        enum: ['user','admin']
    },
    referer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
    },
    usage : {
        type : Number,
        default : 1,
    },
    verified : {
        type : Boolean,
        default : false
    },
    verificationCode : {
        type : String,
        default : undefined
    },
    verificationExpire : {
        type : Date
    }
});

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({_id:this.id}, process.env.JWT_ACC_ACTIVATE,{
        expiresIn:'30d'
    })
};

UserSchema.methods.getResetPasswordToken = function () {
    
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("Users", UserSchema);